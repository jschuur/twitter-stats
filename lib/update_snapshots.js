import Twitter from 'twitter-lite';
import pluralize from 'pluralize';

import { writeSnapshot, writeProfileData } from './db.js';

const snapshotFields = [
  'followers_count',
  'friends_count',
  'statuses_count',
  'listed_count',
  'favourites_count',
];
var twitter;

const numFormat = new Intl.NumberFormat('en-GB').format;

// Authenticate against the Twitter API
async function authTwitter() {
  const app = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  });

  try {
    var response = await app.getBearerToken();
  } catch (err) {
    throw new Error(
      `Unable to authenticate against Twitter API: getBearerToken error (${err.errors[0].message})`
    );
  }

  twitter = new Twitter({
    bearer_token: response.access_token,
  });
}

// Save latest Twitter snapshot for one account
export async function updateSnapshots(screen_name) {
  if (!twitter) await authTwitter();

  try {
    var response = await twitter.get('users/show', { screen_name });
  } catch (err) {
    throw new Error(
      `Couldn't get updates from Twitter API for ${screen_name}: users/show error (${err.errors[0].message})`
    );
  }

  const { followers_count } = response;
  console.log(
    `${screen_name} has ${numFormat(followers_count)} ${pluralize('follower', followers_count)}`
  );

  // Extract the fields we care about
  const snapshot = snapshotFields.reduce(
    (acc, field) => ({ [field]: response[field], ...acc }),
    {}
  );

  try {
    await writeSnapshot(screen_name, snapshot);

    // Also store the full profile details from the last update
    await writeProfileData(screen_name, response);
  } catch (err) {
    throw new Error(`Couldn't save Twitter updates to the database: ${err.message}`);
  }

  return followers_count;
}