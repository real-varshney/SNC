import { SNCRequest } from '../globalTypes';

export interface ExecutableRequest {
  request: SNCRequest;
  controller: AbortController;
  resolve: (response: any) => void;
  reject: (error: any) => void;
}

export type TransportFn = (req: SNCRequest, signal: AbortSignal) => Promise<any>;
