export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum SNCRequestPriority {
  LOW = 0,
  NORMAL = 5,
  HIGH = 8,
  CRITICAL = 10
}

export type PriorityValue = SNCRequestPriority 
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface SNCRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;

  priority?: PriorityValue;
  tags?: string[];
  cache?: boolean;
  retry?: number;
  timeout?: number;

  prefetch?: boolean;
  fallbackUrls?: string[];

  pagination?: boolean;
  infiniteScroll?: boolean;

  meta?: Record<string, any>;
}


export interface NetworkRequest {
  id: string;                      
  originalRequest: SNCRequest;    

  startTime?: number;              
  retryCount: number;             
  status: 'initiated' | 'queued' | 'running' | 'success' | 'failed';

  timeMap: {
    queuedAt?: number;
    startedAt?: number;
    completedAt?: number;
    failedAt?: number;
    retriedAt?: number[];
  };

  failureDetails?: {
    errorMessage: string;
    errorCode?: string | number;
    attempt: number;
  }[];

  resolve: (response: any) => void;  
  reject: (error: any) => void;      
}



export interface NetworkResponse<T = any> {
  status: number;                 
  statusText?: string;            
  data: T;                       
  headers?: Record<string, string>; 

  timeMap?: {
    requestSentAt?: number;
    responseReceivedAt?: number;
  };

  meta?: Record<string, any>;
}


export interface NetworkError {
  message: string;                 
  code?: string | number;        

  type?: 'NetworkError' | 'TimeoutError' | 'AbortError' | 'HTTPError' | 'UnknownError';

  status?: number;

  originalError?: any;

  timeMap?: {
    errorOccurredAt?: number;
    retryAttemptedAt?: number[];
  };

  meta?: Record<string, any>;
}
