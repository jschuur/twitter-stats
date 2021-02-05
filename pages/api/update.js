import { performance } from 'perf_hooks';

import { connectToDatabase } from '../../util/mongodb';
import logger from '../util/logger';
import { readAccounts } from '../../lib/db';
import { updateSnapshots } from '../../lib/update_snapshots';

const numFormat = new Intl.NumberFormat('en-GB').format;

// API handler for triggering snapshot updates
 export default async function handler(req, res) {
  const startTime = performance.now();
  const { db } = await connectToDatabase();
  let results = {};

  try {
    var twitterAccounts = await readAccounts();
  } catch ({ message }) {
    logger.error(message);

    return res.status(400).json({ error: message })
  }

  // TODO: Bulk update
  for (const account of twitterAccounts) {
    try {
      const followers = await updateSnapshots(account.screen_name);

      results[account.screen_name] = followers;
    } catch ({ message }) {
      logger.error(message);

      continue;
    }
  }

  const endTime = performance.now();
  res.json({
    '_execution_time': `${numFormat(endTime - startTime)} ms`,
    message: 'Update completed',
    results
  });
}