import pluralize from 'pluralize';

import logger from '../util/logger';
import { readAccounts, writeSnapshot, updateAccountData, writeTweets } from '../lib/db';
import { getTwitterProfile, getTweets } from '../lib/twitter';

const numFormat = new Intl.NumberFormat('en-GB').format;

async function updateTweets(account) {
  const { username } = account;
  const { results: tweets } = await getTweets(account);

  if (tweets.length) {
    logger.info(`Retreived ${tweets.length} ${pluralize('tweet', tweets.length)} for ${username}`);

    await writeTweets({ account, tweets });
  } else {
    logger.warn(`Did not find any tweets for ${username}!`);
  }
}

// Save latest Twitter snapshot for one account
async function updateAccount({ account, skipTweets }) {
  const { username } = account;

  try {
    var { results: profile } = await getTwitterProfile(account);
  } catch (error) {
    throw new Error(
      `Couldn't get updates from Twitter API for ${account.username} (${unescape(
        JSON.stringify(error)
      )})`
    );
  }

  const { followers_count } = profile.public_metrics;
  logger.info(
    `${username} has ${numFormat(followers_count)} ${pluralize('follower', followers_count)}`
  );

  // extract the fields we need for a snapshot
  await writeSnapshot({ username, ...profile.public_metrics });
  await updateAccountData(username, { profile });

  if (!skipTweets) await updateTweets(account);

  return followers_count;
}

export default async function updateAccounts({ skipTweets }) {
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
