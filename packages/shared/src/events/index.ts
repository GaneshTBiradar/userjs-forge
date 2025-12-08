import type { EventCallback, EventSubscription } from "./types";

export class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): EventSubscription {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)?.add(callback);

    return {
      unsubscribe: () => this.off(event, callback),
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T = unknown>(event: string, callback: EventCallback<T>): EventSubscription {
    const wrappedCallback: EventCallback<T> = async (data) => {
      this.off(event, wrappedCallback);
      await callback(data);
    };

    return this.on(event, wrappedCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit<T = unknown>(event: string, data?: T): Promise<void> {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    const promises: Promise<void>[] = [];

    callbacks.forEach((callback) => {
      const result = callback(data);
      if (result instanceof Promise) {
        promises.push(result);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Emit event synchronously (doesn't wait for async callbacks)
   */
  emitSync<T = unknown>(event: string, data?: T): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event callback for "${event}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
}

export { DOMEventManager } from "./dom-events";
export * from "./types";
export type { EventCallback, EventSubscription };
