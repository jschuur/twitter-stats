import Link from 'next/link';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import { RECENT_DAYS } from 'util/config';
import { BackgroundColor } from 'chalk';

function buildAccountElements(account) {
  var followerChangeText = '-',
    followerChangeColor = '';

  const {
    recent_followers_count,
    profile: {
      public_metrics: { followers_count },
    },
  } = account;
  const followerChange = followers_count - recent_followers_count;

  if (followerChange != 0) {
    followerChangeColor = followerChange > 0 ? 'text-green-500' : 'text-red-500';
    followerChangeText = Intl.NumberFormat('en-GB', {
      style: 'decimal',
      signDisplay: 'exceptZero',
    }).format(followerChange);
  }

  return {
    followerCount: Intl.NumberFormat('en-GB').format(followers_count),
    followerChangeColor,
    followerChangeText,
  };
}

function FollowerStatsAccount(account) {
  const { username } = account;
  const { followerCount, followerChangeColor, followerChangeText } = buildAccountElements(account);

  return (
    <div className='mt-2' key={username}>
      <a href={`https://twitter.com/${username}`}>{username}</a>: {followerCount} (
      <span className={followerChangeColor}>{followerChangeText}</span>)
    </div>
  );
}

export default function FollowerStats({ accounts, lastUpdate }) {
  return (
    <div>
      <h1 className='text-4xl'>Twitter Followers</h1>
      {accounts.map(FollowerStatsAccount)}
      <p className='text-xs pt-3 float-right text-right'>
        <i>
          Changes in the past {RECENT_DAYS} days (<Link href='/charts'>charts</Link>)
          <br /> Last update:{' '}
          <span title={new Date(lastUpdate).toLocaleString()}>
            {formatDistanceToNow(new Date(lastUpdate))} ago
          </span>
        </i>
      </p>
    </div>
  );
}
