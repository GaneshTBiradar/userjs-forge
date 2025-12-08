export class DOMEventManager {
  private listeners: Map<string, Set<{ element: Element; handler: EventListener }>> = new Map();

  /**
   * Add event listener with automatic cleanup tracking
   */
  on<K extends keyof HTMLElementEventMap>(
    element: Element,
    event: K,
    handler: (this: Element, ev: HTMLElementEventMap[K]) => unknown,
    options?: AddEventListenerOptions,
  ): () => void {
    const wrappedHandler = handler as EventListener;
    element.addEventListener(event, wrappedHandler, options);

    const key = `${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)?.add({ element, handler: wrappedHandler });

    return () => this.off(element, event, wrappedHandler);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof HTMLElementEventMap>(
    element: Element,
    event: K,
    handler: EventListener,
  ): void {
    element.removeEventListener(event, handler);

    const key = `${event}`;
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((listener) => {
        if (listener.element === element && listener.handler === handler) {
          listeners.delete(listener);
        }
      });

      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /**
   * Add delegated event listener
   */
  delegate<K extends keyof HTMLElementEventMap>(
    parent: Element,
    selector: string,
    event: K,
    handler: (this: Element, ev: HTMLElementEventMap[K]) => unknown,
  ): () => void {
    const wrappedHandler = (e: Event) => {
      const target = e.target as Element;
      const element = target.closest(selector);
      if (element) {
        handler.call(element, e as HTMLElementEventMap[K]);
      }
    };

    return this.on(parent, event, wrappedHandler as EventListener);
  }

  /**
   * Remove all event listeners
   */
  removeAll(event?: string): void {
    if (event) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.forEach(({ element, handler }) => {
          element.removeEventListener(event, handler);
        });
        this.listeners.delete(event);
      }
    } else {
      this.listeners.forEach((listeners, event) => {
        listeners.forEach(({ element, handler }) => {
          element.removeEventListener(event, handler);
        });
      });
      this.listeners.clear();
    }
  }

  /**
   * Get listener count
   */
  count(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size || 0;
    }

    let total = 0;
    this.listeners.forEach((listeners) => {
      total += listeners.size;
    });
    return total;
  }
}
