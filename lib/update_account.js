import pluralize from 'pluralize';

import { writeSnapshot, updateAccountData, writeTweets } from 'lib/db.js';
import { getTwitterProfile, getTweets } from 'lib/twitter';
import logger from 'util/logger';

const numFormat = new Intl.NumberFormat('en-GB').format;

async function updateTweets(account) {
  const { username } = account;
  const tweets = await getTweets(account);

  if (tweets.length) {
    logger.debug(`Retreived ${tweets.length} ${pluralize('tweet', tweets.length)} for ${username}`);

    await writeTweets({ account, tweets });
  } else {
    logger.warn(`Did not find any tweets for ${username}!`);
  }
}

// Save latest Twitter snapshot for one account
export default async function updateAccount({ account, skipTweets }) {
  const { username } = account;

  try {
    var profile = await getTwitterProfile(account);
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
