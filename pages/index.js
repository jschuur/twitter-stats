import { subDays, format } from 'date-fns';
import { readAccounts } from 'lib/db';
import { connectToDatabase } from 'util/mongodb';

import FollowerStats from 'components/FolllowerStats';

import { RECENT_DAYS } from 'util/config';

export default function Home({ accounts, lastUpdate }) {
  // -webkit-fill-available centers on mobile regardless of browser UI bars if the
  // height is 100% and not vh100. 'h-full sm:h-screen' uses 100% on mobile only.
  return (
    <div style={{ minHeight: "-webkit-fill-available" }} className="flex h-full sm:h-screen justify-center items-center">
      <FollowerStats accounts={accounts} lastUpdate={lastUpdate} />
    </div>
  );
}

export async function getStaticProps(context) {
  const { db } = await connectToDatabase();
  const accounts = await readAccounts();

  // Build list of recent follower counts
  const recentDate = format(subDays(new Date(), RECENT_DAYS), 'yyyy-MM-dd');

  for (const account of accounts) {
    const snapshot = await db
      .collection('snapshots')
      .findOne({ username: account.username, date: { $gte: recentDate } });
    account.recent_followers_count = snapshot.followers_count;
  }

  return {
    props: { accounts, lastUpdate: new Date().toISOString() },
  };
}
