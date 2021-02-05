import { performance } from 'perf_hooks';
import { Parser } from 'json2csv';

import { connectToDatabase } from 'util/mongodb';
import logger from 'util/logger';
import apiWrapper from 'util/api_wrapper';
import { readSnapshots } from 'lib/db';

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

function sendCSV({ snapshots, screen_name, res }) {
  const csvParser = new Parser({ fields: csvFields });
  const csvResults = csvParser.parse(snapshots);
  const filename = `snapshots${screen_name ? `_${screen_name}` : ''}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  return res.send(csvResults);
}

// API handler for getting stats snapshots
async function handler(req, res) {
  const startTime = performance.now();
  const { db } = await connectToDatabase();

  const screen_name = req.query?.screen_name?.[0];
  const csvFormat = req.query?.format === 'csv';

  try {
    var snapshots = await readSnapshots(screen_name);
  } catch ({ message }) {
    logger.error(error);

    return res.status(500, { error: message });
  }

  const endTime = performance.now();
  const _execution_time = `${numFormat(endTime - startTime)} ms`;

  if (snapshots.length) {
    if (csvFormat) {
      return sendCSV({ snapshots, screen_name, res });
    } else {

      return res.json({
        _execution_time,
        message: 'Snapshots retrieved successfully',
        results: snapshots,
      });
    }
  } else return res.status(404).json({ _execution_time, message: `Unable to find snapshots for ${screen_name}` });
}

export default apiWrapper(handler);