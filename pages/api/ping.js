import { performance } from 'perf_hooks';

import logger from 'util/logger';
import apiWrapper from 'util/api_wrapper';
import { httpResponse } from 'util/misc';

async function handler(req, res) {
  const startTime = performance.now();

  httpResponse({
    res,
    message: 'Pong',
    startTime,
  });
}

export default apiWrapper(handler);