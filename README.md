# Xhr

[![Build Status](https://travis-ci.org/teclone/xhr.svg?branch=master)](https://travis-ci.org/teclone/xhr)
[![Coverage Status](https://coveralls.io/repos/github/teclone/xhr/badge.svg?branch=master)](https://coveralls.io/github/teclone/xhr?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/%40teclone%2Fxhr.svg)](https://badge.fury.io/js/%40teclone%2Fxhr)
![npm](https://img.shields.io/npm/dt/%40teclone%2Fxhr.svg)

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
