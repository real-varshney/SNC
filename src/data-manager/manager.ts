import { CacheItem } from './types';
import { MemoryCache } from './cache';
import { storage } from './storage';

class DataManager {
  private MEMORY_CACHE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  private cache = new MemoryCache(this.MEMORY_CACHE_MAX_SIZE);

  async set(key: string, data: string): Promise<void> {
    const size = data.length * 2;
  
    if (size <= this.MEMORY_CACHE_MAX_SIZE) {
      await this.cache.set(key, data); 
    } else {
      const now = Date.now();
      const metadata: CacheItem = {
        location: 'ROM',
        size,
        lastUsed: now,
        parts: undefined,
      };
      await this.cache.setMetadata(key, metadata);
      console.log("Storing in ROM storage with key:", key, "and data length:", data.length);
      console.log("Data:", data);
      console.log("Data length:", data.length);
      console.log("Data type:", typeof data);
      console.log("Storage initiated :" + storage);
      console.log("Storage type:", typeof storage);
      const parts = await storage.set(key, data, metadata);
      const updatedMeta = { ...metadata, parts };
      await this.cache.setMetadata(key, updatedMeta); 
    }
  }
  

  async get(key: string): Promise<string | undefined | null> {
    const cached = await this.cache.getMetadata(key);
    
    if (!cached) return null;
    cached.lastUsed = Date.now();

    if (cached.location === 'MEMORY') {
      return cached.data;
    } else {
      const data = await storage.get(key,cached);
      return data;
    }
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
    await storage.delete(key);
  }
}

export const dataManager = new DataManager();