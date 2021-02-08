import { Parser } from 'json2csv';

import apiWrapper from 'util/api_wrapper';
import { readSnapshots } from 'lib/db';

const numFormat = new Intl.NumberFormat('en-GB').format;

const csvFields = [
  'username',
  'date',
  'following_count',
  'listed_count',
  'tweet_count',
  'followers_count',
];

function sendCSV({ snapshots, username, res }) {
  const csvParser = new Parser({ fields: csvFields });
  const csvResults = csvParser.parse(snapshots);
  const filename = `snapshots${username ? `_${username}` : ''}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  return res.send(csvResults);
}

// API handler for getting stats snapshots
async function handler(req, res) {
  const username = req.query?.username?.[0];
  const csvFormat = req.query?.format === 'csv';

  const snapshots = await readSnapshots({ username, clean: true });

  if (snapshots.length) {
    if (csvFormat) {
      return sendCSV({ snapshots, username, res });
    } else {
      req.response = {
        message: 'Snapshots retrieved successfully',
        results: snapshots,
      };
    }
  } else req.response = { status: 404, error: `Unable to find snapshots for ${username}` };
}

export default apiWrapper(handler);