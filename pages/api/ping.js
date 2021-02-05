import logger from 'util/logger';
import apiWrapper from 'util/api_wrapper';

function handler(req, res) {
  res.json({
    message: 'Pong',
  });
}

export default apiWrapper(handler);