import { readAccounts } from '../lib/db';
import { connectToDatabase } from '../util/mongodb';

import FollowerStats from '../components/FolllowerStats';

export default function Home({ accounts }) {
  return (
    <div className="flex h-screen justify-center items-center">
      <FollowerStats accounts={ accounts } />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { db } = await connectToDatabase();
  const accounts = await readAccounts();

  return { props: { accounts } };
}
