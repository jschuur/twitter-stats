import { performance } from 'perf_hooks';

import updateAccount from 'lib/update_account';
import apiWrapper from 'util/api_wrapper';
import logger from 'util/logger';
import { httpResponse } from 'util/misc';
import { readAccounts } from 'lib/db';

async function updateAccounts() {
  let results = {};
  const accounts = await readAccounts();

  for (const account of accounts) {
    logger.debug(`Processing ${account.screen_name}`);;
    results[account.screen_name] = await updateAccount(account);
  }

  return results;
}

// API handler for triggering snapshot updates
async function handler(req, res) {
  const startTime = performance.now();
  const results = await updateAccounts();

  httpResponse({
    res,
    startTime,
    message: 'Update completed',
    results,
  });
}

export default apiWrapper(handler);