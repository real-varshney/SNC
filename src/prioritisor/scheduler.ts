import { Executor } from "../executor/executor";
import { NetworkRequest, NetworkResponse, NetworkError } from "../globalType";

export class Scheduler {
  private queue: NetworkRequest[] = [];
  private activeCount = 0;
  private maxConcurrent: number;
  private executor: Executor;

  constructor(maxConcurrent = 4, executor: Executor) {
    this.maxConcurrent = maxConcurrent;
    this.executor = executor;
  }

  enqueue(networkRequest: NetworkRequest) {
    if (!networkRequest.timeMap.queuedAt) {
      networkRequest.timeMap.queuedAt = Date.now();
    }

    networkRequest.status = 'queued'; // can keep this here or also move to executor on enqueue if preferred
    this.queue.push(networkRequest);

    this.queue.sort((a, b) => (b.originalRequest.priority ?? 5) - (a.originalRequest.priority ?? 5));

    this.tryDispatch();
  }

  private tryDispatch() {
    if (this.activeCount >= this.maxConcurrent) return;

    const nextRequest = this.queue.shift();
    if (!nextRequest) return;

    this.activeCount++;

    this.executor.execute(nextRequest)
      .then((response: NetworkResponse) => {
        nextRequest.resolve(response);
      })
      .catch((error: NetworkError) => {
        if ((nextRequest.retryCount ?? 0) < (nextRequest.originalRequest.retry ?? 0)) {
          nextRequest.retryCount++;
          if (!nextRequest.timeMap.retriedAt) nextRequest.timeMap.retriedAt = [];
          nextRequest.timeMap.retriedAt.push(Date.now());
          this.enqueue(nextRequest);
        } else {
          nextRequest.reject(error);
        }
      })
      .finally(() => {
        this.activeCount--;
        this.tryDispatch();
      });
  }
}
