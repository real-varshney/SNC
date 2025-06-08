import { MEMORY_CACHE_MAX_SIZE } from '../config';
import { CacheItem } from './types';

export class MemoryCache {
  private maxSize: number;
  private currentSize: number;
  private cacheName: string;

  constructor(maxSize = MEMORY_CACHE_MAX_SIZE, cacheName = 'memory-cache') {
    this.maxSize = maxSize;
    this.currentSize = 0;
    this.cacheName = cacheName;
  }

  private wrapKey(key: string): string {
    return `https://memory.cache/${encodeURIComponent(key)}`;
  }

  private unwrapKey(url: string): string {
    const prefix = 'https://memory.cache/';
    return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : url;
  }

  async get(key: string): Promise<string | null> {
    const wrappedKey = this.wrapKey(key);
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(wrappedKey);
    if (!response) return null;

    const item = await response.json() as CacheItem;
    if (item.location !== 'MEMORY' || !item.data) return null;

    item.lastUsed = Date.now();
    await this.setMetadata(key, item); // update timestamp
    return item.data;
  }

  async set(key: string, data: string): Promise<void> {
    const size = data.length * 2; // Approximate size in bytes
    if (size > this.maxSize) throw new Error('Item size exceeds max memory cache size');

    const wrappedKey = this.wrapKey(key);
    const cache = await caches.open(this.cacheName);
    const existingRes = await cache.match(wrappedKey);

    if (existingRes) {
      const existing = await existingRes.json() as CacheItem;
      if (existing.location === 'MEMORY') {
        this.currentSize -= existing.size;
      }
    }

    const item: CacheItem = {
      data,
      size,
      lastUsed: Date.now(),
      location: 'MEMORY',
    };

    const response = new Response(JSON.stringify(item), {
      headers: { 'Content-Type': 'application/json' },
    });

    await cache.put(wrappedKey, response);
    this.currentSize += size;

    await this.evictIfNeeded();
  }

  async delete(key: string): Promise<void> {
    const wrappedKey = this.wrapKey(key);
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(wrappedKey);

    if (response) {
      const item = await response.json() as CacheItem;
      if (item.location === 'MEMORY') {
        this.currentSize -= item.size;
      }
    }

    await cache.delete(wrappedKey);
  }

  async clear(): Promise<void> {
    await caches.delete(this.cacheName);
    this.currentSize = 0;
  }

  async getMetadata(key: string): Promise<CacheItem | undefined> {
    const wrappedKey = this.wrapKey(key);
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(wrappedKey);
    if (!response) return undefined;
    return await response.json() as CacheItem;
  }

  async setMetadata(key: string, metadata: CacheItem): Promise<void> {
    const wrappedKey = this.wrapKey(key);
    const cache = await caches.open(this.cacheName);
    const existingRes = await cache.match(wrappedKey);

    if (existingRes) {
      const existing = await existingRes.json() as CacheItem;
      this.currentSize -= existing.size;
    }

    const response = new Response(JSON.stringify(metadata), {
      headers: { 'Content-Type': 'application/json' },
    });

    await cache.put(wrappedKey, response);
    this.currentSize += metadata.size;
  }

  private async evictIfNeeded(): Promise<void> {
    const cache = await caches.open(this.cacheName);
    const keys = await cache.keys();
    const entries: { key: string; item: CacheItem }[] = [];

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const item = await response.json() as CacheItem;
        if (item.location === 'MEMORY') {
          const rawKey = this.unwrapKey(request.url);
          entries.push({ key: rawKey, item });
        }
      }
    }

    entries.sort((a, b) => a.item.lastUsed - b.item.lastUsed);

    for (const entry of entries) {
      if (this.currentSize <= this.maxSize) break;
      await this.delete(entry.key);
    }
  }
}
