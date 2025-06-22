import { SNCRequest } from '../globalTypes';

export const defaultTransport = async (req: SNCRequest, signal: AbortSignal): Promise<any> => {
  const url = new URL(req.url);
  if (req.params) {
    Object.entries(req.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(req.body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
};
