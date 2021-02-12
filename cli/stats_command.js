import Table from 'cli-table';
import program from 'commander';
import { subDays, format, formatDistanceToNow } from 'date-fns';
import chalk from 'chalk';
import pluralize from 'pluralize';

import { readAccounts, readSnapshots } from 'lib/db';
import { connectToDatabase } from 'util/mongodb';

function formatNumber(number, prevNumber) {
  if (typeof prevNumber === 'undefined')
    return Intl.NumberFormat('en-GB', { style: 'decimal' }).format(number);

  if (number === prevNumber) return '-';

  const formatPlusMinus = Intl.NumberFormat('en-GB', {
    style: 'decimal',
    signDisplay: 'exceptZero',
  }).format;
  return (number > prevNumber ? chalk.green : chalk.red)(formatPlusMinus(number - prevNumber));
}

export default async function showStats({ days }) {
  const { db, client } = await connectToDatabase();
  const accounts = await readAccounts();

  const recentDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  for (const account of accounts) {
    const snapshot = await db
      .collection('snapshots')
      .findOne({ username: account.username, date: { $gte: recentDate } });
    account.recent_followers_count = snapshot.followers_count;
    account.recent_tweet_count = snapshot.tweet_count;
  }

  const table = new Table({
    head: ['username', 'followers', `±${days} d`, 'tweets', `±${days} d`],
    style: { head: ['cyan'] },
    colAligns: ['left', 'right', 'right', 'right', 'right'],
  });

  accounts.forEach(({ username, profile, recent_followers_count, recent_tweet_count }) => {
    const { followers_count, tweet_count } = profile.public_metrics;

    table.push([
      username,
      formatNumber(followers_count),
      formatNumber(followers_count, recent_followers_count),
      formatNumber(tweet_count),
      formatNumber(tweet_count, recent_tweet_count),
    ]);
  });

  const lastUpdate = formatDistanceToNow(new Date(accounts[0].last_update), {
    addSuffix: true,
    includeSeconds: true,
  });

  const accountsCount = await db.collection('accounts').countDocuments();
  const tweetsCount = await db.collection('tweets').countDocuments();
  const snapshotsCount = await db.collection('snapshots').countDocuments();

  console.log(table.toString());
  console.log(
    `\n${formatNumber(accountsCount)} ${pluralize('account', accountsCount)}, ` +
      `${formatNumber(tweetsCount)} ${pluralize('tweet', tweetsCount)}, ` +
      `${formatNumber(snapshotsCount)} ${pluralize('snapshot', snapshotsCount)}`
  );
  console.log(`\nLast update: ${lastUpdate}`);

  client.close();
}
