import { install } from '@teclone/utils';
import { Transport } from './Transport';
import { RequestHeaders, RequestOptions, RequestMethod, Request } from './Request';
import { Response } from './Response';

interface XhrRequestOptions extends Omit<RequestOptions, 'method'> {
  throwIfNotOk?: boolean;
}

const configs: {
  defaultTimeout: number;
  requestHeaders: RequestHeaders;
  throwIfNotOk: boolean;
} = {
  defaultTimeout: 15000,
  requestHeaders: {},
  throwIfNotOk: false,
};

/**
 * carries out the fetch call
 */
const fetch = (
  method: RequestMethod,
  url: string,
  options?: XhrRequestOptions,
): Promise<Response> => {
  options = options || {};
  const resolvedOptions: RequestOptions = {
    ...(options || {}),
    method,
    defaultTimeout: configs.defaultTimeout,
    globalHeaders: {
      ...configs.requestHeaders,
    },
  };
  return new Request(Transport.create(), url, resolvedOptions).send().then(request => {
    const response = new Response(request.url, request.transport);
    const throwIfNotOk = options.throwIfNotOk ?? configs.throwIfNotOk;

    if (!response.ok && throwIfNotOk) {
      throw response;
    }
    return response;
  });
};

export const Xhr = {
  /**
   * installs the globals
   */
  install(host: Window & typeof globalThis, root: Document) {
    install(host, root);
    return this;
  },

  /**
   * sets the default timeout for request
   */
  setDefaultTimeout(timeout: number | null) {
    configs.defaultTimeout = timeout;
    return this;
  },

  /**
   * controls if the request should throw if the response status is not within the 200 to 300 range
   */
  throwIfNotOk(value: boolean = true) {
    configs.throwIfNotOk = value;
    return this;
  },

  /**
   * sets the base url for all requests;
   * @param url
   */
  setBaseUrl(url: string) {
    Request.setBaseUrl(url);
    return this;
  },

  /**
   * indicates if xml http request is supported
   *@type {boolean}
   */
  get supported() {
    return Transport.supported;
  },

  /**
   * returns the transport ie implementation string
   */
  get ieString() {
    return Transport.ieString;
  },

  /**
   * adds a http request header to the global header object
   *@returns {this}
   */
  addRequestHeader(name: string, value: string | number) {
    configs.requestHeaders[name] = value.toString();
    return this;
  },

  /**
   * adds http request headers to the global header object.
   */
  addHeaders(entries: RequestHeaders) {
    for (const [name, value] of Object.entries(entries)) {
      this.addRequestHeader(name, value);
    }
    return this;
  },

  /**
   * removes the request header from the global request headers.
   */
  removeRequestHeader(name: string) {
    delete configs.requestHeaders[name];
    return this;
  },

  /**
   * removes comma separated list of request headers from the global request headers
   */
  removeRequestHeaders(...names: string[]) {
    names.forEach(name => {
      this.removeRequestHeader(name);
    });

    return this;
  },

  /**
   * get request
   */
  get(url: string, options?: XhrRequestOptions) {
    return fetch('GET', url, options);
  },

  /**
   * post request
   */
  post(url: string, options?: XhrRequestOptions) {
    return fetch('POST', url, options);
  },

  /**
   * put request
   */
  put(url: string, options?: XhrRequestOptions) {
    return fetch('PUT', url, options);
  },

  /**
   * delete request
   */
  delete(url: string, options?: XhrRequestOptions) {
    return fetch('DELETE', url, options);
  },

  /**
   * head request
   */
  head(url: string, options?: XhrRequestOptions) {
    return fetch('HEAD', url, options);
  },

  /**
   * options request
   */
  options(url: string, options?: XhrRequestOptions) {
    return fetch('OPTIONS', url, options);
  },
};
