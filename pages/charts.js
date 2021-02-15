import LineChart from 'components/LineChart';
import FollowerStats from '../components/FolllowerStats';
import { readAccounts, readRecentSnapshotData } from 'lib/db';
import { transformIntervalStartDelta, transformPreviousDelta } from '../util/misc';

import { RECENT_DAYS } from 'util/config';

export default function Charts({ followerSnapshots, tweetSnapshots, days }) {
  return (
    <div className='mt-20 flex flex-wrap justify-center items-center'>
      <LineChart snapshots={followerSnapshots} title={'Follower gains'} />
      <LineChart snapshots={tweetSnapshots} title={'Tweets'} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const accounts = await readAccounts();

  const followerSnapshots = await readRecentSnapshotData({
    usernames: accounts.map((account) => account.profile.username),
    days: RECENT_DAYS,
    field: 'followers_count',
    transform: transformIntervalStartDelta,
  });

  const tweetSnapshots = await readRecentSnapshotData({
    usernames: accounts.map((account) => account.profile.username),
    days: RECENT_DAYS,
    field: 'tweet_count',
    transform: transformPreviousDelta,
  });

  return {
    props: { tweetSnapshots, followerSnapshots, days: RECENT_DAYS },
  };
}
