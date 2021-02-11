import apiWrapper from 'util/api_wrapper';
import updateAccounts from 'lib/update_accounts';

// API handler for triggering snapshot updates
async function handler(req, res) {
  const { skipTweets } = req.query;

  const results = await updateAccounts({ skipTweets });

  res.response = {
    message: 'Update completed',
    results,
  };
}

export default apiWrapper(handler);