import { NetworkRequest , SNCRequest } from './globalType';

export function createNetworkRequest(
  sncRequest: SNCRequest,
  resolve: (value: any) => void,
  reject: (reason?: any) => void
): NetworkRequest {
  const now = Date.now();
  return {
    id: generateUID(sncRequest),
    originalRequest: sncRequest,
    startTime: undefined,
    retryCount: 0,
    status: 'queued',
    timeMap: {
      queuedAt: now,
      retriedAt: []
    },
    failureDetails: [],
    resolve,
    reject,
  };
}

function generateUID(req: Omit<SNCRequest, 'id'>): string {
  const base = JSON.stringify({
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    headers: req.headers,
  });
  return `snc_${hashString(base)}`;
}

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
