import chalk from 'chalk';
import { performance } from 'perf_hooks';

import { connectToDatabase } from '../../../util/mongodb';
import { readAccounts } from '../../../lib/db';

const numFormat = new Intl.NumberFormat('en-GB').format;

// API handler for requesting account list/details
export default async function handler(req, res) {
  const startTime = performance.now();
  const { db } = await connectToDatabase();

  const screen_name = req.query?.screen_name?.[0];
  const fullDetails = req.query?.details || screen_name;

  try {
    var twitterAccounts = await readAccounts({ screen_name });
  } catch ({ message }) {
    console.log(`${chalk.red('Error:')} ${message}`);

    return res.status(500, { error: message });
  }

  if (twitterAccounts.length) {
    const results = fullDetails
      ? screen_name
        ? twitterAccounts[0]
        : twitterAccounts
      : twitterAccounts.map((account) => account.screen_name);
    const message = screen_name
      ? 'Twitter account details retrieved successfully'
      : 'Twitter account(s) retrieved successfully';

  const endTime = performance.now();
    return res.json({
      _execution_time: `${numFormat(endTime - startTime)} ms`,
      message,
      results
    });
  } else
    return res.status(404)
              .json({ message: `Unable to find account named ${screen_name}` });
}
