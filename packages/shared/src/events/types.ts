export type EventCallback<T = any> = (data: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}
