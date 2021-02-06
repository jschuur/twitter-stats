import logger from './logger';
import { httpResponse } from 'util/misc';

// Wrapper function to catch errors and do centralised access logging
const apiWrapper = (handler) => {
  return async (req, res) => {
    logger.debug(`API access: ${req.method} ${req.url}`);

    try {
      await handler(req, res);
    } catch ({ message }) {
      logger.error(message);
      httpResponse({ res, status: 500, error: message });
    }
  };
};

export default apiWrapper;
