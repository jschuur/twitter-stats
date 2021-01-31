import { connectToDatabase } from '../util/mongodb';

export default function Home({ accounts }) {
  return (
    <>
      <h1>Twitter Stats</h1>
      {accounts.map((account) => (
        <>
          <h2>{account.screen_name}</h2>
          <p>{Intl.NumberFormat().format(account.followers)} followers</p>
        </>
      ))}
    </>
  );
}

export async function getServerSideProps(context) {
  const { db } = await connectToDatabase();

  const accounts = await db.collection('accounts').find({}).toArray();

  return {
    props: {
      accounts: JSON.parse(JSON.stringify(accounts)),
    },
  };
}
