import dateFormat from 'date-fns/format';

import { connectToDatabase } from '../util/mongodb';

// Get the list of accounts we're tracking
export async function readAccounts({ screen_name, includeMongoId } = {}) {
  const { db } = await connectToDatabase();

  const filter = screen_name ? { screen_name } : {};
  const options = includeMongoId ? {} : { projection: { _id: 0 } };

  try {
    var results = await db.collection('accounts').find(filter, options).toArray();
  } catch (err) {
    throw new Error(`Couldn't get accounts list from the DB: collection.find error (${err.message})`);
  }

  return results;
}

export async function writeProfileData(screen_name, data) {
  const { db } = await connectToDatabase();

  try {
    await db.collection('accounts').updateOne(
      { screen_name },
      { $set: { last_update: new Date().toISOString(), profile: data } });
  } catch (err) {
    throw new Error(`collection.updateOne() error (${err.message})`);
  }
}

export async function writeSnapshot(screen_name, snapshot) {
  const { db } = await connectToDatabase();

  // Add date if needed
  if (!snapshot.date) snapshot.date = dateFormat(new Date(), 'yyyy-MM-dd');

  let params = {
    TableName: process.env.SNAPSHOTS_TABLE,
    Item: snapshot,
  };

  try {
    await db.collection('snapshots').updateOne(
      { screen_name, date: snapshot.date },
      { $set: { last_update: new Date().toISOString(), ...snapshot } },
      { upsert: true});
  } catch (err) {
    throw new Error(`collection.updateOne error (${err.message})`);
  }
}

export async function readSnapshots(screen_name) {
  const { db } = await connectToDatabase();

  const filter = screen_name ? { screen_name } : {};

  try {
    var results = await db.collection('snapshots').find(filter, { projection: { _id: 0 } }).toArray();
  } catch (err) {
    throw new Error(`Couldn't get snapshots from the DB: collection.find error (${err.message})`);
  }

  return results;
}