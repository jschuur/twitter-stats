import dateFormat from 'date-fns/format';
import { connectToDatabase } from 'util/mongodb';

const privateFieldsAccounts = ['_id', 'oauth_access_token', 'oauth_access_token_secret'];
const privateFieldsSnapshots = ['_id'];

const cleanProjection = (fields) => fields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {});

// Get the list of accounts we're tracking
export async function readAccounts({ screen_name, clean } = {}) {
  const { db } = await connectToDatabase();

  const filter = screen_name ? { screen_name } : {};
  const projection = clean
    ? cleanProjection(privateFieldsAccounts)
    : {};

  try {
    var results = await db.collection('accounts').find(filter, { projection }).toArray();
  } catch (err) {
    throw new Error(
      `Couldn't get accounts list from the DB: collection.find error (${err.message})`
    );
  }

  return results;
}

export async function writeAccountData(screen_name, data) {
  const { db } = await connectToDatabase();

  try {
    await db
      .collection('accounts')
      .updateOne({ screen_name }, { $set: { last_update: new Date().toISOString(), ...data } });
  } catch ({ message }) {
    throw new Error(`collection.updateOne() error (${message})`);
  }
}

export async function writeSnapshot(snapshot) {
  const { db } = await connectToDatabase();
  const { screen_name } = snapshot;

  // Add date if needed
  if (!snapshot.date) snapshot.date = dateFormat(new Date(), 'yyyy-MM-dd');

  try {
    await db
      .collection('snapshots')
      .updateOne(
        { screen_name, date: snapshot.date },
        { $set: { last_update: new Date().toISOString(), ...snapshot } },
        { upsert: true }
      );
  } catch ({ message }) {
    throw new Error(`collection.updateOne error (${message})`);
  }
}

export async function readSnapshots({ screen_name, clean }) {
  const { db } = await connectToDatabase();

  const filter = screen_name ? { screen_name } : {};
  const projection = clean ? cleanProjection(privateFieldsSnapshots) : {};

  try {
    var results = await db.collection('snapshots').find(filter, { projection }).toArray();
  } catch ({ message }) {
    throw new Error(`Couldn't get snapshots from the DB: collection.find error (${message})`);
  }

  return results;
}