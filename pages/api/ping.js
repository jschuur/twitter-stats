import { performance } from 'perf_hooks';

import logger from 'util/logger';
import apiWrapper from 'util/api_wrapper.js';
import { httpResponse } from 'util/misc';

export default function handler(req, res) {
  const startTime = performance.now();

  httpResponse({
    res,
    message: 'Pong',
    startTime,
  });
}
