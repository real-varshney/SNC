import { STORAGE_CHUNK_SIZE } from '../config';
import LZString from 'lz-string';
import { CacheItem } from './types';

const DB_NAME = 'SNCStorageDB';
const STORE_NAME = 'snc_chunks';

class Storage {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.openDB();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save large data by chunking compressed string, under one key + chunk index keys
async set(key: string, data: string, metadata?: CacheItem): Promise<number> {
  console.log('Storage.set called with key:', key, 'and data length:', data.length); // Add this line for debuggi
    const db = await this.dbPromise;

    // Compress data first to reduce storage
    const compressed = LZString.compress(data);
    console.log('Compressed data length:', compressed.length)
    console.log('Compressed data:', compressed)
    // Chunk the compressed data
    const chunks: string[] = [];
    for (let i = 0; i < compressed.length; i += STORAGE_CHUNK_SIZE) {
      chunks.push(compressed.slice(i, i + STORAGE_CHUNK_SIZE));
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Store each chunk with key format: `${key}_chunk_${index}`
      chunks.forEach((chunk, idx) => {
        store.put(chunk, `${key}_chunk_${idx}`);
      });
      // Store metadata with total parts count
      store.put(chunks.length, `${key}_chunks_count`);

      tx.oncomplete = () => {
        console.log('Data stored successfully');
        resolve(chunks.length);
      };
      tx.onerror = () => {
        console.error('Error storing data:', tx.error);
        reject(tx.error);
      }
    });
  }

  // Retrieve large data by getting all chunks, concatenating and decompressing
  async get(key: string, metadata?: CacheItem ): Promise<string | null> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

       const parts = metadata?.parts || 0;
        if (!parts || parts <= 0) {
          resolve(null);
          return;
        }

        const chunks: string[] = [];
        let fetchedCount = 0;

        for (let i = 0; i < parts; i++) {
          const chunkRequest = store.get(`${key}_chunk_${i}`);
          chunkRequest.onsuccess = () => {
            chunks[i] = chunkRequest.result;
            fetchedCount++;

            if (fetchedCount === parts) {
              // All chunks fetched, join and decompress
              const compressed = chunks.join('');
              const decompressed = LZString.decompress(compressed);
              resolve(decompressed);
            }
          };
          chunkRequest.onerror = () => reject(chunkRequest.error);
        }
    });
  }

  // Delete all chunks + parts count for the key
  async delete(key: string): Promise<void> {
    const db = await this.dbPromise;

    return new Promise(async (resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const countRequest = store.get(`${key}_chunks_count`);
        countRequest.onsuccess = () => {
          const parts = countRequest.result as number | undefined;

          if (!parts || parts <= 0) {
            // Nothing to delete
            resolve();
            return;
          }

          // Delete all chunk entries + count entry
          for (let i = 0; i < parts; i++) {
            store.delete(`${key}_chunk_${i}`);
          }
          store.delete(`${key}_chunks_count`);

          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        countRequest.onerror = () => reject(countRequest.error);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const storage = new Storage();
