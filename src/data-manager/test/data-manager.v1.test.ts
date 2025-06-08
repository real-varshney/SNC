import { dataManager } from '../manager';
import { storage } from '../storage';
import { MemoryCache } from '../cache';

// Mock the storage module
jest.mock('../storage', () => ({
  storage: {
    set: jest.fn(async (key: string, data: string, metadata: any) => ['part1']),
    get: jest.fn(async (key: string, metadata: any) => 'mocked ROM data'),
    delete: jest.fn(async (key: string) => {}),
  },
}));

describe('DataManager', () => {
  beforeEach(() => {
    // Clear memory and mocks before each test
    (dataManager as any).cache = new MemoryCache(100); // Use small cache for testing
    jest.clearAllMocks();
  });

  it('should store and retrieve data from memory when within size limit', async () => {
    const key = 'memoryKey';
    const data = 'short data';

    await dataManager.set(key, data);
    const result = await dataManager.get(key);

    expect(result).toBe(data);
  });

  it('should store metadata and delegate data to ROM (storage) when size exceeds limit', async () => {
    const key = 'romKey';
    const data = 'x'.repeat(1000000); // simulate large data

    await dataManager.set(key, data);

    // Ensure metadata was set and storage.set was called
    expect(storage.set).toHaveBeenCalled();
  });

  it('should retrieve data from ROM (storage) when stored there', async () => {
    const key = 'romKey';
    const data = 'x'.repeat(1000000);

    await dataManager.set(key, data);
    const result = await dataManager.get(key);

    // expect(storage.get).toHaveBeenCalled();
    expect(result).toBe('mocked ROM data');
  });

  it('should delete both memory and ROM entries', async () => {
    const key = 'deleteKey';
    const data = 'some data';

    await dataManager.set(key, data);
    await dataManager.delete(key);

    // Cache deletion should be silent, storage.delete should be called
    expect(storage.delete).toHaveBeenCalledWith(key);
  });

  it('should return null if key not found', async () => {
    const result = await dataManager.get('nonexistent');
    expect(result).toBeNull();
  });
});
