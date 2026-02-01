type TListener = (...args: any[]) => void;

type TListenerMap = Record<string, TListener[]>;

class EventBus {
  private listeners: TListenerMap;

  constructor() {
    this.listeners = {};
  }

  on(event: string, callback: TListener): void {
    (this.listeners[event] ||= []).push(callback);
  }

  off(event: string, callback: TListener): void {
    if (!this.listeners[event]) throw new Error(`No event: ${event}`);

    this.listeners[event] = this.listeners[event].filter((l) => l !== callback);
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.listeners[event]) throw new Error(`No event: ${event}`);

    this.listeners[event].forEach((listener) => listener(...args));
  }
}

export default EventBus;
