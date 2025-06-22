import { MAX_CONCURRENT_REQUESTS } from '../config';
import { ExecutableRequest, TransportFn } from './types';
import { SNCRequest } from '../globalTypes';
import { defaultTransport } from './transport'; // fetch or axios
import { debounceMap } from '../utils';
import { throttleMap } from '../utils';

class Executor {
  private queue: ExecutableRequest[] = [];
  private active: number = 0;
  private transport: TransportFn = defaultTransport;

  setTransport(fn: TransportFn) {
    this.transport = fn;
  }

  async execute(request: SNCRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      const debounceKey = request.debounce?.key;
      const throttleKey = request.throttle?.key;

      if (debounceKey && debounceMap.has(debounceKey)) {
        clearTimeout(debounceMap.get(debounceKey));
      }

      if (throttleKey && throttleMap.has(throttleKey)) {
        const lastCall = throttleMap.get(throttleKey);
        const now = Date.now();
        const interval = request.throttle?.interval ?? 500;
      
        if (lastCall !== undefined && now - lastCall < interval) {
          return reject(new Error('Throttled'));
        }
        throttleMap.set(throttleKey, now);
      } else if (throttleKey) {
        throttleMap.set(throttleKey, Date.now());
      }
      

      const controller = new AbortController();

      const task: ExecutableRequest = {
        request,
        controller,
        resolve,
        reject,
      };

      if (debounceKey) {
        const timeout = request.debounce?.interval ?? 300;
        debounceMap.set(
          debounceKey,
          setTimeout(() => this.enqueue(task), timeout)
        );
      } else {
        this.enqueue(task);
      }
    });
  }

  private enqueue(task: ExecutableRequest): void {
    this.queue.push(task);
    this.runQueue();
  }

  private runQueue(): void {
    while (this.active < MAX_CONCURRENT_REQUESTS && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) continue;

      this.active++;
      this.process(task).finally(() => {
        this.active--;
        this.runQueue();
      });
    }
  }

  private async process({ request, controller, resolve, reject }: ExecutableRequest) {
    const timeout = request.timeout ?? 10000;

    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error('Request Timeout'));
    }, timeout);

    try {
      const response = await this.transport(request, controller.signal);
      clearTimeout(timeoutId);
      resolve(response);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  }

  cancelAll(): void {
    for (const task of this.queue) {
      task.controller.abort();
    }
    this.queue = [];
  }
}

export const executor = new Executor();
