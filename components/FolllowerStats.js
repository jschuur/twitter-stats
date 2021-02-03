import { RECENT_DAYS } from '../util/config';

function buildAccountElements(account) {
  var followerChangeText = '-',
    followerChangeColor = '';

  const {
    recent_followers_count,
    profile: { followers_count },
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
  const { screen_name } = account;
  const { followerCount, followerChangeColor, followerChangeText } = buildAccountElements(account);

  return (
    <div className='mt-2' key={screen_name}>
      <a href={`https://twitter.com/${screen_name}`}>{screen_name}</a>: {followerCount} (
      <span className={followerChangeColor}>{followerChangeText}</span>)
    </div>
  );
}

export default function FollowerStats({ accounts }) {
  return (
    <div>
      <h1 className='text-4xl'>Twitter Followers</h1>
      {accounts.map(FollowerStatsAccount)}
      <p className='text-xs pt-3 float-right'>
        <i>changes in the past {RECENT_DAYS} days</i>
      </p>
    </div>
  );
}
