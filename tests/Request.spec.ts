import { Request } from '../src/Request';
import { Transport } from '../src/Transport';
import { start, close } from './helpers/server';
import { port } from './helpers/constants';

describe('Xhr Request', function() {
  const testData = {
    name: 'Harrison',
    age: '22',
  };

  let transport: XMLHttpRequest = null;

  beforeEach(() => {
    transport = Transport.create();
  });

  beforeAll(() => {
    Request.setBaseUrl(`http://localhost:${port}/`);
    return start();
  });

  afterAll(() => {
    return close();
  });

  describe(`constructor`, function() {
    it(`should create an instance when called`, function() {
      const request = new Request(transport, 'say-hello');
      expect(request).toBeInstanceOf(Request);
    });
  });

  describe('send', function() {
    it(`should send the request and return a promise`, function() {
      const request = new Request(transport, 'say-hello');
      return request.send().then(request => {
        expect(request.state).toEqual('complete');
        expect(request.transport.responseText).toEqual('hello world!');
      });
    });

    it(`should send the request, terminating the request if response time exceeds timeout value`, function() {
      const request = new Request(transport, 'prolonged-request', { timeout: 3000 });
      return request.send().then(request => {
        expect(request.state).toEqual('timedout');
      });
    });

    it(`should send the request, watching for progress event if an options.progress callback
        method is specified`, function() {
      const spy = jest.fn();
      const request = new Request(transport, 'say-hello', { onProgress: spy });
      return request.send().then(request => {
        expect(spy.mock.calls.length).toBeGreaterThan(1);
      });
    });

    it(`should ignore the contentType options and send the request when called,
        sending data content as query parameters if method is neither post nor put`, function() {
      const request = new Request(transport, '/report-query', {
        data: testData,
      });
      return request.send().then(request => {
        expect(request.transport.responseText).toEqual(JSON.stringify(testData));
      });
    });

    it(`should append the data to the existing query in the url if there is already an
        existing query in the url`, function() {
      const request = new Request(transport, '/report-query?name=Harrison', {
        data: {
          age: '22',
        },
      });
      return request.send().then(request => {
        expect(request.transport.responseText).toEqual(JSON.stringify(testData));
      });
    });

    it(`should send the request when called, sending form-urlencoded content to the server if the
        request method is post or put and request data is not a form-data and contentType header
        is not set or is set as 'application/x-www-form-urlencoded'`, function() {
      const request = new Request(transport, '/report-header/content-type', {
        method: 'POST',
        data: testData,
      });
      return request.send().then(request => {
        expect(request.transport.responseText).toEqual(
          'application/x-www-form-urlencoded',
        );
      });
    });
  });
});
