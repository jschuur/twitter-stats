import apiWrapper from 'util/api_wrapper';

async function handler(req, res) {
  req.response = { message: 'Pong' };
}

export default apiWrapper(handler);