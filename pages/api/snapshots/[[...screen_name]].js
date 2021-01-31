import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { Parser } from 'json2csv';

import { connectToDatabase } from '../../../util/mongodb';
import { readSnapshots } from '../../../lib/db';

const numFormat = new Intl.NumberFormat('en-GB').format;

const csvFields = [
  'screen_name',
  'date',
  'friends_count',
  'listed_count',
  'statuses_count',
  'followers_count',
  'favourites_count',
];

// API handler for getting stats snapshots
export default async function handler(req, res) {
  const startTime = performance.now();
  const { db } = await connectToDatabase();

  const screen_name = req.query?.screen_name?.[0];
  const csvFormat = req.query?.format === 'csv';

  try {
    var results = await readSnapshots(screen_name);
  } catch ({ message }) {
    console.log(`${chalk.red('Error:')} ${message}`);

    return res.status(500, { error: message });
  }

  if (results.length) {
    if (csvFormat) {
      const csvParser = new Parser({ fields: csvFields });
      const csvResults = csvParser.parse(results);
      const filename = `snapshots${screen_name ? `_${screen_name}` : ''}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csvResults);
    } else {
      const endTime = performance.now();

      return res.json({
        _execution_time: `${numFormat(endTime - startTime)} ms`,
        message: 'Snapshots retrieved successfully',
        results
      });
    }
  } else return res.status(404).json({ message: `Unable to find snapshots for ${screen_name}` });
}
