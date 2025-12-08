import type { StorageItem, StorageOptions } from "./types";

export class StorageUtils {
  private readonly prefix: string;
  private readonly storage: Storage;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || "";
    this.storage = options.useSessionStorage ? sessionStorage : localStorage;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  /**
   * Set item in storage
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    };

    try {
      this.storage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error("Failed to set storage item:", error);
      throw error;
    }
  }

  /**
   * Get item from storage
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const rawItem = this.storage.getItem(this.getKey(key));
      if (!rawItem) return defaultValue;

      const item: StorageItem<T> = JSON.parse(rawItem);

      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.error("Failed to get storage item:", error);
      return defaultValue;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): void {
    this.storage.removeItem(this.getKey(key));
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    if (!this.prefix) {
      this.storage.clear();
      return;
    }

    const keys = this.keys();
    keys.forEach((key) => {
      this.remove(key);
    });
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.storage.getItem(this.getKey(key)) !== null;
  }

  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    const allKeys: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        if (!this.prefix || key.startsWith(`${this.prefix}:`)) {
          const cleanKey = this.prefix ? key.substring(this.prefix.length + 1) : key;
          allKeys.push(cleanKey);
        }
      }
    }

    return allKeys;
  }

  /**
   * Get all items as object
   */
  getAll<T = any>(): Record<string, T> {
    const result: Record<string, T> = {};
    const keys = this.keys();

    keys.forEach((key) => {
      const value = this.get<T>(key);
      if (value !== undefined) {
        result[key] = value;
      }
    });

    return result;
  }

  /**
   * Set multiple items at once
   */
  setMultiple<T>(items: Record<string, T>, ttlMs?: number): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, ttlMs);
    });
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0;
    const keys = this.keys();

    keys.forEach((key) => {
      const item = this.storage.getItem(this.getKey(key));
      if (item) {
        size += item.length + key.length;
      }
    });

    return size;
  }

  /**
   * Remove expired items
   */
  cleanExpired(): void {
    const keys = this.keys();

    keys.forEach((key) => {
      try {
        const rawItem = this.storage.getItem(this.getKey(key));
        if (!rawItem) return;

        const item: StorageItem = JSON.parse(rawItem);
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.remove(key);
        }
      } catch (error) {
        console.error("Failed to clean expired item:", error);
      }
    });
  }

  /**
   * Export all data as JSON
   */
  export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import data from JSON
   */
  import(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      this.setMultiple(data);
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }
}

export type { StorageItem, StorageOptions };
