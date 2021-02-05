import { performance } from 'perf_hooks';

export function httpResponse({ res, status, message, error, results, startTime }) {
  var body = {};

  if (startTime) {
    const endTime = performance.now();
    body._execution_time = `${Intl.NumberFormat('en-GB').format(endTime - startTime)} ms`;
  }

  if (!status) status = 200;
  body.status = status;

  if (message) body.message = message;
  if (error) body.error = error;
  if (results) body.results = results;

  return res.status(status).json(body);
}
