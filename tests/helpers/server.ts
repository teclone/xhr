import RServer from '@teclone/r-server';
import path from 'path';
import { port } from './constants';

const app = RServer.create({
  publicPaths: [path.resolve(__dirname)],
});

//send hello world message
app.get('/say-hello', (req, res) => {
  return res.end('hello world!');
});

//prolong request
app.get('prolonged-request', (req, res) => {
  return res.wait(6000).then(res => {
    //@ts-ignore
    return res.end('prolonged');
  });
});

// request query data
app.get('report-query', (req, res) => {
  return res.end(JSON.stringify(req.query));
});

//report request header
app.all('report-header/{header}', (request, response, header: string) => {
  return response.status(200).end(request.headers[header] || 'undefined');
});

export const start = () => {
  return new Promise((resolve, reject) => {
    app.listen(port, resolve);
  });
};

export const close = () => {
  return new Promise((resolve, reject) => {
    if (app.listening) {
      app.close(resolve);
    } else {
      resolve();
    }
  });
};
