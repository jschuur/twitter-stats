import updateAccount from 'lib/update_account';
import apiWrapper from 'util/api_wrapper';
import logger from 'util/logger';
import { readAccounts } from 'lib/db';

async function updateAccounts({ skipTweets }) {
  let results = {};
  const accounts = await readAccounts();

  for (const account of accounts) {
    if (!account.paused) {
      logger.debug(`Processing ${account.username}`);

      // Continue for account specific errors, in case they are Oauth related
      try {
        results[account.username] = await updateAccount({ account, skipTweets });
      } catch ({ message }) {
        logger.error(message);
        results[account.username] = message;

        continue;
      }
    }
  }

  return results;
}

// API handler for triggering snapshot updates
async function handler(req, res) {
  const { skipTweets } = req.query;

  const results = await updateAccounts({ skipTweets });

  req.response = {
    message: 'Update completed',
    results,
  };
}

export default apiWrapper(handler);