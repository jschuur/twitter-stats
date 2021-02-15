import { subDays, format } from 'date-fns';

import { connectToDatabase } from 'util/mongodb';
import logger from 'util/logger';
import { getTwitterProfile } from 'lib/twitter';
import { buildAccount } from 'util/misc';
import { RECENT_DAYS } from 'util/config';

const privateFieldsAccounts = ['_id', 'credentials'];
const privateFieldsSnapshots = ['_id'];

const cleanProjection = (fields) => fields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {});

export async function addAccount(accountData) {
  const { oauth_access_token, oauth_access_token_secret } = accountData;
  const { db } = await connectToDatabase();

  const { results: profile } = await getTwitterProfile(buildAccount(accountData));

  await writeAccountData(profile.username, {
    profile,
    credentials: { oauth_access_token, oauth_access_token_secret },
  });
}

// Get the list of accounts we're tracking
export async function readAccounts({ username, fullDetails } = {}) {
  const { db } = await connectToDatabase();

  const filter = username ? { username } : {};
  const projection = fullDetails ? {} : cleanProjection(privateFieldsAccounts);

  try {
    var results = await db.collection('accounts').find(filter, { projection }).toArray();
  } catch (err) {
    throw new Error(
      `Couldn't get accounts list from the DB: collection.find error (${err.message})`
    );
  }

  return results;
}

// TODO: rename to writeAccountDats
export async function writeAccountData(username, data) {
  const { db } = await connectToDatabase();

  try {
    await db
      .collection('accounts')
      .updateOne(
        { username },
        { $set: { last_update: new Date().toISOString(), ...data } },
        { upsert: true }
      );
  } catch ({ message }) {
    throw new Error(`collection.updateOne() error (${message})`);
  }
}

export async function writeSnapshot(snapshot) {
  const { db } = await connectToDatabase();
  const { username } = snapshot;

  const date = format(new Date(), 'yyyy-MM-dd');

  try {
    await db
      .collection('snapshots')
      .updateOne(
        { username, date },
        { $set: { date, last_update: new Date().toISOString(), ...snapshot } },
        { upsert: true }
      );
  } catch ({ message }) {
    throw new Error(`collection.updateOne error (${message})`);
  }
}

export async function readSnapshots({ username, clean }) {
  const { db } = await connectToDatabase();

  const filter = username ? { username } : {};
  const projection = clean ? cleanProjection(privateFieldsSnapshots) : {};

  try {
    var results = await db.collection('snapshots').find(filter, { projection }).toArray();
  } catch ({ message }) {
    throw new Error(`collection.find error (${message})`);
  }

  return results;
}

export async function writeTweets({ account, tweets }) {
  const { db } = await connectToDatabase();

  try {
    await db.collection('tweets').bulkWrite(
      tweets.map(({ id, ...tweet }) => ({
        updateOne: {
          filter: { id },
          update: { $set: tweet },
          upsert: true,
        },
      }))
    );
  } catch ({ message }) {
    throw new Error(`Couldn't bulkWrite new tweets (${message})`);
  }
}

export async function readRecentSnapshotData(args) {
  const { usernames, days, field, transform } = args;
  var results = [];

  const { db } = await connectToDatabase();

  const recentDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  for (const username of usernames) {
    const snapshots = await db
      .collection('snapshots')
      .find({ username, date: { $gte: recentDate } })
      .sort({ date: 1 })
      .project({ _id: 0, date: 1, [field]: 1 })
      .map((doc) => ({ value: doc[field], date: doc.date }))
      .toArray();

    // transform functions abstract away how we reformat the data for charts
    results.push({ username, data: transform ? transform(snapshots) : snapshots });
  }

  return results;
}