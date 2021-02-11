import apiWrapper from 'util/api_wrapper';
import { readAccounts } from 'lib/db';

const numFormat = new Intl.NumberFormat('en-GB').format;

function buildResults({ accounts, username, fullDetails }) {
  if (accounts.length) {
    const results = fullDetails
      ? username
        ? accounts[0]
        : accounts
      : accounts.map((account) => account.username);
    const message = username
      ? 'Twitter account details retrieved successfully'
      : 'Twitter account(s) retrieved successfully';

    return { status: 200, message, results };
  } else return { status: 404, error: `Unable to find account named ${username}` };
}

// API handler for requesting account list/details
async function handler(req, res) {
  const username = req.query?.username?.[0];
  const fullDetails = req.query?.details || username;

  const accounts = await readAccounts({ username, clean: true });

  req.response = buildResults({ accounts, username, fullDetails });
}

export default apiWrapper(handler);