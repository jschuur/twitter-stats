function FollowerStatsAccount({ screen_name, followers }) {
  //TODO: Show 30 day differential after follower count

  return(
    <div className="mt-2" key={ screen_name }>
      <a href={`https://twitter.com/${screen_name}` }>{screen_name}</a>: {Intl.NumberFormat().format(followers)}
    </div>
  );
}

export default function FollowerStats({ accounts }) {
  return (
    <div>
    <h1 className="text-4xl">Twitter Followers</h1>
      {accounts.map(FollowerStatsAccount)}
    </div>
  )
}