import { GlobalQueue } from '../executionqueue';
import type { NetworkRequest, NetworkResponse } from '../globaltype';

const CONCURRENCY_LIMIT = 5;
let activeCount = 0;

async function fetchWithTimeout(req: NetworkRequest): Promise<NetworkResponse> {

  const { url, method, headers, body } = req.originalRequest;
  const controller = new AbortController();
  const timeout = req.originalRequest.timeout ?? 15000;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return {
      status: response.status,
      data,
      headers: {},
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function processRequest(req: NetworkRequest) {
  try {
    activeCount++;
    const res = await fetchWithTimeout(req);
    req.resolve(res);
  } catch (err) {
    req.reject(err);
  } finally {
    activeCount--;
    scheduleNext();
  }
}

function scheduleNext() {
  while (activeCount < CONCURRENCY_LIMIT && GlobalQueue.size() > 0) {
    const nextReq = GlobalQueue.dequeue();
    if (!nextReq) break;
    processRequest(nextReq);
  }
}

export function startExecutor() {
  scheduleNext();
}

GlobalQueue.subscribe((hasData: boolean) => {
  if (hasData) {
    startExecutor();
  }
});
