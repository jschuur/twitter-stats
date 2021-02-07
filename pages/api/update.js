import updateAccount from 'lib/update_account';
import apiWrapper from 'util/api_wrapper';
import logger from 'util/logger';
import { readAccounts } from 'lib/db';

async function updateAccounts() {
  let results = {};
  const accounts = await readAccounts();

  for (const account of accounts) {
    if (!account.paused) {
      logger.debug(`Processing ${account.screen_name}`);

      // Continue for account specific errors, in case they are Oauth related
      try {
        results[account.screen_name] = await updateAccount(account);
      } catch ({ message }) {
        logger.error(message);
        results[account.screen_name] = message;

        continue;
      }
    }
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