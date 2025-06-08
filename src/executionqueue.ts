// queue.ts
import { NetworkRequest } from "./globaltype"; // Or your actual pat

type QueueListener = (hasData: boolean) => void;

class PriorityQueue {
  private queue: NetworkRequest[] = [];
  private listeners: Set<QueueListener> = new Set();

  enqueue(request: NetworkRequest) {
    this.queue.push(request);
    this.queue.sort(
      (a, b) =>
      (b.originalRequest.priority ?? 0) - (a.originalRequest.priority ?? 0)
    );
    this.trigger(true);
  }

  dequeue(): NetworkRequest | undefined {
    const item = this.queue.shift();
    if (this.queue.length === 0) this.trigger(false);
    return item;
  }

  size() {
    return this.queue.length;
  }

  peek(): NetworkRequest | undefined {
    return this.queue[0];
  }

  subscribe(listener: QueueListener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: QueueListener) {
    this.listeners.delete(listener);
  }

  private trigger(hasData: boolean) {
    for (const listener of this.listeners) {
      listener(hasData);
    }
  }
}

export const GlobalQueue = new PriorityQueue();
