# Xhr

Fetch API compatible implementation in XMLHttpRequest. Fully promisified. Works in browser like environments, including React Native.

## Installation

module is available on npm

```bash
npm install @teclone/xhr
```

## Usage

There are method names for all of these six http methods `get`, `head`, `options`, `post`, `delete`, `put` that you can use to make requests.
By default, the request will never throw even on errors (unlike the Fetch api spec). You need to check the **ok** property of the response object.

This can be changed by setting `options.throwIfNotOk` to `true` or by calling `Xhr.throwIfNotOk(true)` to set this for every request. The value of `throwIfNotOk` in ecah **request options** will always be prioritized ahead of the global settings.

```typescript
import { Xhr } from '@teclone/xhr';

Xhr.get(url, options).then(response => {
  if (response.ok) {
    // do something.
  }
});
```

## Running in Mocked Browser Environments

To make it seemless when you want to run in mocked browser environment, **Xhr** module exports `install` method to make this possible. Call the `install` method, passing in the window and document object.

**Running in jsdom environment:**

```javascript
import JSDOM from 'jsdom';
import { Xhr } from '@teclone/xhr';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'urltomock',
  pretendToBeVisual: true,
});

Xhr.install(dom.window, dom.window.document);
```
