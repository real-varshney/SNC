import { SNCRequest , NetworkRequest} from '../globalTypes';
import { prioritiser } from '../prioritisor/prioritiser';
import { dataManager } from '../data-manager/manager';
import { executor } from '../executor/executor';
import { createNetworkRequest } from '../utils';

class Orchestrator {
  private activeRequests = new Map<string, NetworkRequest>();

  async call(request: SNCRequest): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const netReq = createNetworkRequest(request, resolve, reject);

      this.activeRequests.set(netReq.id, netReq);

      const shouldCache = request.cache ?? false;

      if (shouldCache) {
        const cachedData = await dataManager.get(request.url);
        if (cachedData != null) {
          this.activeRequests.delete(netReq.id);
          return resolve(cachedData);
        }
      }

      prioritiser.addRequest({
        ...request,
        meta: {
          ...(request.meta ?? {}),
          __networkRequestId: netReq.id,
        },
      });

      this.processNext();
    });
  }

  private processNext(): void {
    const nextBatch = prioritiser.nextRequests();

    for (const req of nextBatch) {
      const requestId = req.meta?.__networkRequestId as string;
      const netReq = this.activeRequests.get(requestId);

      if (!netReq) continue;

      netReq.status = 'running';
      netReq.timeMap.startedAt = Date.now();

      executor.execute(req)
        .then(async (result) => {
          netReq.status = 'success';
          netReq.timeMap.completedAt = Date.now();

          if (req.cache) {
            await dataManager.set(req.url, result);
          }

          netReq.resolve(result);
          this.activeRequests.delete(requestId);
          prioritiser.markComplete();
        })
        .catch((error) => {
          netReq.status = 'failed';
          netReq.timeMap.failedAt = Date.now();
          netReq.failureDetails?.push({
            errorMessage: error?.message ?? 'Unknown error',
            errorCode: error?.code,
            attempt: netReq.retryCount,
          });

          netReq.reject(error);
          this.activeRequests.delete(requestId);
          prioritiser.markComplete();
        });
    }
  }

  getActiveRequest(id: string): NetworkRequest | undefined {
    return this.activeRequests.get(id);
  }

  clear(): void {
    this.activeRequests.clear();
    prioritiser.clear();
  }
}

export const orchestrator = new Orchestrator();
