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

    return { status: 200, message, results };
  } else return { status: 404, error: `Unable to find account named ${screen_name}` };
}

// API handler for requesting account list/details
async function handler(req, res) {
  const screen_name = req.query?.screen_name?.[0];
  const fullDetails = req.query?.details || screen_name;

  const accounts = await readAccounts({ screen_name, clean: true });

  req.response = buildResults({ accounts, screen_name, fullDetails });
}

export default apiWrapper(handler);