export interface StorageOptions {
  prefix?: string;
  useSessionStorage?: boolean;
}

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}
