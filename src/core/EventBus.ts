type EventCallback = (...args: any[]) => void;

interface Subscription {
  unsubscribe: () => void;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]>;

  private constructor() {
    this.listeners = new Map();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(event: string, callback: EventCallback): Subscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const eventListeners = this.listeners.get(event)!;
    eventListeners.push(callback);

    return {
      unsubscribe: () => {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  public publish(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // Create a copy of the array to avoid issues if listeners are added/removed during emit
      [...eventListeners].forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error executing event '${event}':`, error);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
