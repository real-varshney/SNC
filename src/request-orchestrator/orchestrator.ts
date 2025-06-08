import { DataManager } from '../data-manager/manager';
// import { Prioritiser } from '../prioritiser/prioritiser';
// import { Executor } from '../executor/executor'; 
import { SNCRequest } from '../globalType';
import { createNetworkRequest } from '../utils';

export class RequestOrchestrator {
  private dataManager: DataManager;
  private prioritiser: Prioritiser;
  private executor: Executor;

  constructor() {
    this.dataManager = new DataManager();
    this.prioritiser = new Prioritiser();
    this.executor = new Executor();
  }

async handle(request: SNCRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    const networkRequest = createNetworkRequest(request, resolve, reject);

    const cached = this.dataManager.get(networkRequest.id);
    if (cached) {
      resolve(cached);
      return;
    }


    //TODO: create a working chart of how to execute a single req. around multiple flows/
    //TODO: make sure how to manage multiple request call from separate snc obj/

    this.prioritiser.schedule(networkRequest).then(() => {
      this.executor.execute(networkRequest.originalRequest)
        .then(async (response :any) => {
          await this.dataManager.set(networkRequest.id, JSON.stringify(response));
          resolve(response);
        })
        .catch(reject);
    }).catch(reject);
  });
}

}
