import updateAccount from 'lib/update_account';
import apiWrapper from 'util/api_wrapper';
import logger from 'util/logger';
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
  const results = await updateAccounts();

  req.response = {
    message: 'Update completed',
    results,
  };
}

export default apiWrapper(handler);