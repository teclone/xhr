import { host, onInstall } from '@teclone/utils';

let ieString = '';

let createTransport: () => XMLHttpRequest = null;

// supports react native here.
if (typeof XMLHttpRequest !== 'undefined') {
  createTransport = () => new XMLHttpRequest();
}

/**
 * assign transport create function
 */
onInstall(() => {
  if (typeof host.XMLHttpRequest !== 'undefined') {
    createTransport = () => {
      return new host.XMLHttpRequest();
    };
  } else if (typeof host.ActiveXObject !== 'undefined') {
    for (const version of ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0']) {
      try {
        new host.ActiveXObject(version);
        ieString = version;
        createTransport = () => {
          return new host.ActiveXObject(ieString);
        };
        break;
      } catch (ex) {
        //
      }
    }
  }
});

export const Transport = {
  /**
   * indicates if xhr transport is supported
   */
  get supported() {
    return createTransport !== null;
  },

  /**
   * holds the ie string for active x object implementation
   */
  get ieString() {
    return ieString;
  },

  /**
   * creates the transport object
   */
  create() {
    if (createTransport) {
      return createTransport();
    } else {
      throw new Error('xhr transport creation is not available');
    }
  },
};
