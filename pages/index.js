import { readAccounts } from '../lib/db';
import { connectToDatabase } from '../util/mongodb';

import FollowerStats from '../components/FolllowerStats';

export default function Home({ accounts }) {
  // -webkit-fill-available centers on mobile regardless of browser UI bars if the
  // height is 100% and not vh100. 'h-full sm:h-screen' uses 100% on mobile only.
  return (
    <div style={{ minHeight: "-webkit-fill-available" }} className="flex h-full sm:h-screen justify-center items-center">
      <FollowerStats accounts={ accounts } />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { db } = await connectToDatabase();
  const accounts = await readAccounts();

  return { props: { accounts } };
}
