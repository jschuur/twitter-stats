import logger from './logger';

const apiWrapper = (handler) => {
  return (req, res) => {
    logger.debug(`API access: ${req.method} ${req.url}`);
    return handler(req, res);
  };
};

export default apiWrapper;
