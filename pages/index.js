import { connectToDatabase } from '../util/mongodb';

export default function Home({ isConnected }) {
  return <h1>Twitter Stats</h1>;
}

export async function getServerSideProps(context) {
  const { client } = await connectToDatabase()

  const isConnected = await client.isConnected()

  return {
    props: { isConnected },
  }
}
