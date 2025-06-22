import { NetworkRequest , PriorityValue, SNCRequest, SNCRequestPriority } from './globalTypes';

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

export function normalizePriority(priority?: PriorityValue): number {
  const DEFAULT = SNCRequestPriority.NORMAL;

  if (priority === undefined || priority === null) return DEFAULT;

  const num = typeof priority === 'number'
    ? priority
    : Number(priority);

  if (Number.isNaN(num)) return DEFAULT;

  return Math.max(0, Math.min(10, num));
}


export const debounceMap = new Map<string, NodeJS.Timeout>();

export const throttleMap = new Map<string, number>();
