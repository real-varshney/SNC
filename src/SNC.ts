import { orchestrator } from './request-orchestrator/orchestrator';
import { SNCRequest, HttpMethod } from './globalTypes';

class SNC {
  private static instance: SNC;

  private constructor() {}

  static getInstance(): SNC {
    if (!SNC.instance) {
      SNC.instance = new SNC();
    }
    return SNC.instance;
  }

  fetch(request: SNCRequest): Promise<any> {
    return orchestrator.call(request);
  }

  callEarly(request: SNCRequest): Promise<any> {
    const boosted: SNCRequest = {
      ...request,
      priority: 10,
      meta: {
        ...(request.meta ?? {}),
        _early: true,
      },
    };
    return orchestrator.call(boosted);
  }

  get(url: string, config?: Omit<SNCRequest, 'url' | 'method'>): Promise<any> {
    return this.fetch({ ...config, url, method: HttpMethod.GET });
  }

  post(url: string, body?: any, config?: Omit<SNCRequest, 'url' | 'method' | 'body'>): Promise<any> {
    return this.fetch({ ...config, url, method: HttpMethod.POST, body });
  }

  put(url: string, body?: any, config?: Omit<SNCRequest, 'url' | 'method' | 'body'>): Promise<any> {
    return this.fetch({ ...config, url, method: HttpMethod.PUT, body });
  }

  delete(url: string, config?: Omit<SNCRequest, 'url' | 'method'>): Promise<any> {
    return this.fetch({ ...config, url, method: HttpMethod.DELETE });
  }

  patch(url: string, body?: any, config?: Omit<SNCRequest, 'url' | 'method' | 'body'>): Promise<any> {
    return this.fetch({ ...config, url, method: HttpMethod.PATCH, body });
  }

  clearAll(): void {
    orchestrator.clear();
  }

}

export const snc = SNC.getInstance();
