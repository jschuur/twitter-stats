import { performance } from 'perf_hooks';

import logger from './logger';

const executionTime = (startTime, endTime) => `${Intl.NumberFormat('en-GB').format(endTime - startTime)} ms`;

// Wrapper function to catch errors, execution time and do logging
const apiWrapper = (handler) => {
  return async (req, res) => {
    logger.debug(`API access: ${req.method} ${req.url}`);

    try {
      var startTime = performance.now();

      await handler(req, res);

      // If response data came in via req, use that
      if (res.response) {
        var { status = 200 } = res.response;

        res.status(status).json({
          _execution_time: executionTime(startTime, performance.now()),
          status,
          ...res.response,
        });
      }
    } catch ({ message }) {
      logger.error(message);
      res.status(500).json({
        _execution_time: executionTime(startTime, performance.now()),
        status: 500,
        error: message,
      });
    }
  };
};

export default apiWrapper;
