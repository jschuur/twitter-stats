import pluralize from 'pluralize';

import { writeSnapshot, writeAccountData } from 'lib/db.js';
import { getTwitterProfile } from 'lib/twitter';
import logger from 'util/logger';

const snapshotFields = [
  'screen_name',
  'followers_count',
  'friends_count',
  'statuses_count',
  'listed_count',
  'favourites_count',
];

const numFormat = new Intl.NumberFormat('en-GB').format;

// Save latest Twitter snapshot for one account
export default async function updateAccount(account) {
  const { screen_name } = account;

  try {
    var profile = await getTwitterProfile(account);
  } catch (error) {
    throw new Error(
      `Couldn't get updates from Twitter API for ${account.screen_name} (${error.errors[0].message})`
    );
  }

  const { followers_count } = profile;
  logger.info(
    `${screen_name} has ${numFormat(followers_count)} ${pluralize('follower', followers_count)}`
  );

  // extract the fields we need for a snapshot
  const snapshot = snapshotFields.reduce((acc, field) => ({ [field]: profile[field], ...acc }), {});
  await writeSnapshot(snapshot);

  await writeAccountData(screen_name, { id: profile.id, profile });

  return followers_count;
}
