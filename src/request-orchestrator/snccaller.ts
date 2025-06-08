import { SNCRequest, HttpMethod, SNCRequestPriority } from '../globalType';
import { RequestOrchestrator } from './orchestrator'; // You can rename accordingly

class SNC {
  private orchestrator: RequestOrchestrator;

  constructor(orchestrator?: RequestOrchestrator) {
    this.orchestrator = orchestrator ?? new RequestOrchestrator();
  }

  call(method: HttpMethod, url: string, options: Partial<SNCRequest> = {}) {
    const request: SNCRequest = {
      method,
      url,
      ...options,
      priority: options.priority ?? SNCRequestPriority.NORMAL,
    };

    return this.orchestrator.handle(request);
  }

  // Convenience methods
  get(url: string, options: Partial<SNCRequest> = {}) {
    return this.call(HttpMethod.GET, url, options);
  }

  post(url: string, options: Partial<SNCRequest> = {}) {
    return this.call(HttpMethod.POST, url, options);
  }

  put(url: string, options: Partial<SNCRequest> = {}) {
    return this.call(HttpMethod.PUT, url, options);
  }

  delete(url: string, options: Partial<SNCRequest> = {}) {
    return this.call(HttpMethod.DELETE, url, options);
  }

  patch(url: string, options: Partial<SNCRequest> = {}) {
    return this.call(HttpMethod.POST, url, options);
  }
}

function createSNCInstance() {
  const instance = new SNC();
  const boundCall = instance.call.bind(instance) as typeof instance.call & SNC;

  boundCall.get = instance.get.bind(instance);
  boundCall.post = instance.post.bind(instance);
  boundCall.put = instance.put.bind(instance);
  boundCall.delete = instance.delete.bind(instance);
  boundCall.patch = instance.patch.bind(instance);

  return boundCall;
}

export const snc = createSNCInstance();
