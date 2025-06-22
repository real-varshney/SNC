import { SNCRequest } from '../globalTypes';
import { normalizePriority } from '../utils';
import { MAX_CONCURRENT_REQUESTS } from '../config';

type PrioritizedRequest = SNCRequest & { timestamp: number };

class Prioritiser {
  private queue: PrioritizedRequest[] = [];
  private running: number = 0;

 addRequest(request: SNCRequest): void {
  const priority = normalizePriority(request.priority); // ensures 0–10 range
  const prioritizedRequest = {
    ...request,
    priority,
    timestamp: Date.now(),
  };

  this.queue.push(prioritizedRequest);
  this.sortQueue();
}

private sortQueue(): void {
  const now = Date.now();

  this.queue.sort((a, b) => {
    const decayA = (a.priority as number) + this.getDecayBoost(a.timestamp, now);
    const decayB = (b.priority as number) + this.getDecayBoost(b.timestamp, now);
    
    return decayB - decayA;
  });
}

private getDecayBoost(queuedAt: number, now: number): number {
  const elapsedSeconds = (now - queuedAt) / 1000;
  return Math.min(elapsedSeconds / 30, 5);
}


  dropRequest(id: string): void {
    this.queue = this.queue.filter(r => r.meta?.id !== id);
  }

  nextRequests(): SNCRequest[] {
    const available = MAX_CONCURRENT_REQUESTS - this.running;
    const next = this.queue.splice(0, available);
    this.running += next.length;
    return next;
  }

  markComplete(): void {
    if (this.running > 0) this.running--;
  }

  clear(): void {
    this.queue = [];
    this.running = 0;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

export const prioritiser = new Prioritiser();
