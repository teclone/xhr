import { copy, encodeData, scopeCallback, Callback } from '@teclone/utils';

export type RequestMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

export type RequestResponseType =
  | 'json'
  | 'arraybuffer'
  | 'document'
  | 'text'
  | 'blob'
  | '';

export type RequestCacheType =
  | 'no-cache'
  | 'reload'
  | 'default'
  | 'no-store'
  | 'only-if-cached'
  | 'force-cache';

export type RequestContentType =
  | 'text/json'
  | 'application/json'
  | 'text/plain'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | '';

export type RequestState =
  | 'idle'
  | 'loading'
  | 'error'
  | 'aborted'
  | 'timedout'
  | 'complete';

export type RequestData = FormData | { [p: string]: any };

export interface RequestHeaders {
  [p: string]: string;
}

export interface RequestOptions {
  /**
   * base url, base url, defaults to empty string
   */
  baseUrl?: string;

  /**
   * request method, defaults to 'GET'
   */
  method?: RequestMethod;

  /**
   * request cache type, defaults to default
   */
  cache?: RequestCacheType;

  /**
   * global request headers
   */
  globalHeaders?: RequestHeaders;

  /**
   * request headers
   */
  headers?: RequestHeaders;

  /**
   * sets withCredentials value, defaults to false
   */
  withCredentials?: boolean;

  /**
   * request content type for post and put requests
   */
  contentType?: RequestContentType;

  /**
   * expected response type from server
   */
  responseType?: RequestResponseType;

  /**
   * request data
   */
  data?: RequestData;

  /**
   * request global timeout
   */
  defaultTimeout?: number;

  /**
   * request timeout, set to null if you don't want the request to time out, put, post and delete requests do not time
   * out by default, unless specifed.
   */
  timeout?: number;

  /**
   * request on progress event
   */
  onProgress?: Callback;
}

export class Request {
  url: string;

  method: RequestMethod;

  cache: RequestCacheType;

  headers: RequestHeaders;

  contentType: RequestContentType;

  responseType: RequestResponseType;

  transport: XMLHttpRequest;

  withCredentials: boolean;

  data: RequestData;

  _resolve?: Callback;

  timeout?: null | number;

  onProgress?: Callback;

  state: RequestState;

  private static baseUrl: string = '';

  /**
   * sets global base url
   */
  static setBaseUrl(url: string) {
    Request.baseUrl = url;
  }

  constructor(transport: XMLHttpRequest, url: string, options?: RequestOptions) {
    options = options || {};

    this.state = 'idle';

    this.url =
      (options.baseUrl || Request.baseUrl || '').replace(/\/*$/gm, '') +
      '/' +
      (url || '').replace(/^\/*/gm, '');

    this.method = options.method || 'GET';

    this.cache = options.cache || 'default';

    this.headers = copy({}, options.globalHeaders, options.headers);

    this.withCredentials = options.withCredentials ?? false;

    this.data = options.data || {};

    this.responseType = options.responseType;
    this.contentType = options.contentType ?? '';

    if (
      this.contentType === '' &&
      ['POST', 'PUT'].includes(this.method) &&
      !(this.data instanceof FormData)
    ) {
      this.contentType = 'application/x-www-form-urlencoded';
    }

    this.timeout = options.timeout ?? null;

    if (
      typeof options.timeout === 'undefined' &&
      !['POST', 'PUT', 'DELETE'].includes(this.method)
    ) {
      this.timeout = options.defaultTimeout ?? null;
    }

    this.onProgress = options.onProgress;
    this.transport = transport;
  }

  /**
   * sends the request
   */
  send(): Promise<Request> {
    return new Promise(resolve => {
      this._resolve = resolve;
      send.call(this);
    });
  }

  /**
   * aborts the request
   */
  abort() {
    this.transport.abort();
    return this;
  }
}

/**
 * set request headers
 * @param request
 */
const setRequestHeaders = (request: Request) => {
  for (const [name, value] of Object.entries(request.headers)) {
    request.transport.setRequestHeader(name, value.toString());
  }
};

/**
 * processes timeout events
 */
const onTimeout = function(this: Request) {
  this.state = 'timedout';
  this._resolve(this);
};

/**
 * processes error events
 */
const onError = function(this: Request) {
  this.state = 'error';
  this._resolve(this);
};

/**
 * processes abort events
 */
const onAbort = function(this: Request) {
  this.state = 'aborted';
  this._resolve(this);
};

/**
 * processes load events
 */
const onLoad = function(this: Request) {
  this.state = 'complete';
  this._resolve(this);
};

/**
 * handles progress event
 */
const onProgress = function(this: Request, e: ProgressEvent) {
  if (e.lengthComputable) {
    this.onProgress?.(e.loaded, e.total);
  }
};

/**
 * initiates the send request
 */
const send = function(this: Request) {
  let url = this.url;
  let data: string | FormData = null;
  let queries = '';

  //resolve data and query
  if (this.method === 'POST' || this.method === 'PUT') {
    switch (this.contentType) {
      case 'application/json':
      case 'text/json':
        this.contentType = 'application/json';
        data = JSON.stringify(this.data);
        break;

      case 'application/x-www-form-urlencoded':
        data = encodeData(this.data as any);
        break;

      default:
        data = this.data as FormData;
    }

    if (this.contentType) {
      this.headers['Content-Type'] = this.contentType;
    }
  } else {
    queries = encodeData(this.data as any);
    if (queries) {
      url = `${url}${url.indexOf('?') > -1 ? '&' : '?'}${queries}`;
      this.url = url;
    }
  }

  //resolve cache control
  switch (this.cache.toLowerCase()) {
    case 'no-store':
      this.headers['Cache-Control'] = 'no-store';
      break;
    case 'no-cache':
    case 'reload':
      this.headers['Cache-Control'] = 'no-cache';
      this.headers.Pragma = 'no-cache';
      break;
    case 'force-cache':
      this.headers['Cache-Control'] = 'max-stale';
      break;
    case 'only-if-cached':
      this.headers['Cache-Control'] = 'only-if-cached';
      break;
  }

  if (this.onProgress) {
    this.transport.onprogress = scopeCallback(onProgress, this);
  }

  this.transport.open(this.method, url, true);

  this.transport.responseType = this.responseType;
  this.transport.withCredentials = this.withCredentials;

  this.transport.onload = scopeCallback(onLoad, this);
  this.transport.onabort = scopeCallback(onAbort, this);
  this.transport.onerror = scopeCallback(onError, this);

  if (this.timeout) {
    this.transport.timeout = this.timeout;
    this.transport.ontimeout = scopeCallback(onTimeout, this);
  }

  setRequestHeaders(this);
  this.transport.send(data);
  this.state = 'loading';
};
