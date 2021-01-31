import { readAccounts } from '../lib/db';
import { connectToDatabase } from '../util/mongodb';

export default function Home({ accounts }) {
  return (
    <>
      <h1>Twitter Stats</h1>
      {accounts.map((account) => (
        <div key={ account.screen_name }>
          <h2>{account.screen_name}</h2>
          <p>{Intl.NumberFormat().format(account.followers)} followers</p>
        </div>
      ))}
    </>
  );
}

export async function getServerSideProps(context) {
  const { db } = await connectToDatabase();
  const accounts = await readAccounts();

  return {
    props: {
      accounts
      // accounts: JSON.parse(JSON.stringify(accounts)),
    },
  };
}
