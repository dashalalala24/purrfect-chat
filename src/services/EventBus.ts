type TEventMap = Record<string, (...args: any[]) => void>;

class EventBus<Events extends TEventMap> {
  listeners: { [K in keyof Events]?: Events[K][] } = {};

  constructor() {
    this.listeners = {};
  }

  on<K extends keyof Events>(event: K, callback: Events[K]): void {
    if (typeof callback !== 'function') {
      console.warn(`EventBus: ignored non-function listener for event "${String(event)}"`, callback);
      return;
    }

    (this.listeners[event] ||= []).push(callback);
  }

  off<K extends keyof Events>(event: K, callback: Events[K]): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event].filter((l) => l !== callback);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const listeners = this.listeners[event];
    if (!listeners || listeners.length === 0) {
      return;
    }

    listeners.forEach((listener) => {
      if (typeof listener !== 'function') {
        console.warn(`EventBus: skipped non-function listener for event "${String(event)}"`, listener);
        return;
      }

      listener(...args);
    });
  }
}

export default EventBus;
