import { performance } from 'perf_hooks';

import { connectToDatabase } from 'util/mongodb';
import logger from 'util/logger';
import apiWrapper from 'util/api_wrapper';
import { readAccounts } from 'lib/db';

const numFormat = new Intl.NumberFormat('en-GB').format;

function buildResults({ accounts, screen_name, fullDetails }) {
  if (accounts.length) {
    const results = fullDetails
      ? screen_name
        ? accounts[0]
        : accounts
      : accounts.map((account) => account.screen_name);
    const message = screen_name
      ? 'Twitter account details retrieved successfully'
      : 'Twitter account(s) retrieved successfully';

    return { statusCode: 200, results: { message, results } };
  } else return { statusCode: 404, message: `Unable to find account named ${screen_name}` };
}

// API handler for requesting account list/details
async function handler(req, res) {
  const startTime = performance.now();
  const { db } = await connectToDatabase();

  const screen_name = req.query?.screen_name?.[0];
  const fullDetails = req.query?.details || screen_name;

  try {
    var accounts = await readAccounts({ screen_name });
  } catch ({ message }) {
    logger.error(message);

    return res.status(500, { error: message });
  }

  const { statusCode, results } = buildResults({ accounts, screen_name, fullDetails });
  const endTime = performance.now();

  return res
    .status(statusCode)
    .json({ _execution_time: `${numFormat(endTime - startTime)} ms`, ...results });
}

export default apiWrapper(handler);