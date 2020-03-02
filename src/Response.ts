import { camelCase } from '@teclone/utils';

export interface ResponseHeaders {
  [p: string]: string;
}

export class Response {
  originalUrl: string;

  redirected: boolean;

  private transport: XMLHttpRequest;

  private headers: ResponseHeaders;

  constructor(url: string, transport: XMLHttpRequest) {
    this.originalUrl = url;
    this.redirected = url !== transport.responseURL;
    this.transport = transport;
  }

  /**
   * returns response url
   */
  get url() {
    return this.transport.responseURL;
  }

  /**
   * boolean indicating if request status is within the 200, 300 range
   */
  get ok() {
    const status = this.transport.status;
    return status >= 200 && status < 400;
  }

  /**
   * response status code
   */
  get status() {
    return this.transport.status;
  }

  /**
   * response status text
   */
  get statusText() {
    return this.transport.statusText;
  }

  /**
   * returns http response header by the entry name
   */
  getHeader(name: string) {
    return this.transport.getResponseHeader(name);
  }

  /**
   * returns all response headers as an object. header keys will be camelCased for easy access using dot notations unless if specifically set
   * to false.
   */
  getHeaders(camelize: boolean = true): ResponseHeaders {
    if (!this.headers) {
      this.headers = {};
      this.transport
        .getAllResponseHeaders()
        .replace(/\n\r?$/, '')
        .split(/\n\r?/)
        .forEach(header => {
          let [name, value] = header.split(':');
          this.headers[name.toLowerCase()] = value.trim();
        });
    }
    if (camelize) {
      return Object.keys(this.headers).reduce((result, key) => {
        result[camelCase(key)] = this.headers[key];
        return result;
      }, {} as ResponseHeaders);
    } else {
      return Object.assign({}, this.headers);
    }
  }

  /**
   * returns response as json object.
   */
  json(): object | null {
    switch (this.transport.responseType) {
      case 'json':
        const contentType = (this.getHeader('Content-Type') || '').toLowerCase();
        if (/(text|application)\/json/.test(contentType)) {
          if (this.transport.response) {
            return this.transport.response;
          } else {
            try {
              return JSON.parse(this.transport.responseText);
            } catch (ex) {}
          }
        }
    }
    return null;
  }

  /**
   * returns response as blob
   */
  blob(): Blob | null {
    if (this.transport.response instanceof Blob) {
      return this.transport.response;
    } else {
      return null;
    }
  }

  /**
   * returns response as array buffer
   */
  arrayBuffer(): ArrayBuffer | null {
    if (this.transport.response instanceof ArrayBuffer) {
      return this.transport.response;
    } else {
      return null;
    }
  }

  /**
   * returns response parsed xml or html document
   */
  document(): Document | null {
    if (this.transport.response instanceof Document) {
      return this.transport.response;
    } else {
      return null;
    }
  }

  /**
   * returns response text
   */
  text(): string | null {
    return this.transport.responseText;
  }
}
