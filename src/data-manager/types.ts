export interface CacheMetadata {
  location: 'MEMORY' | 'ROM';
  size: number;
  lastUsed: number;
  parts?: number;
}

export interface CacheItem extends CacheMetadata {
  data?: string; 
}
