import { NetworkName } from '../src';
import { DposClient } from '../src/DposClient';

const runExample = async () => {
  const networkName = NetworkName.MAINNET;
  const privateKey =
    'aae3250deafff925811a14af4d7d0c9ba88b234c9f98443f9a203231bd36e805'; // Replace with your private key

  const client = new DposClient(networkName, privateKey);

  try {
    const totalVotes = await client.getTotalEligibleVotesCount();
    console.log('Total Eligible Votes:', totalVotes);

    // Add more interactions as needed
  } catch (error) {
    console.error('Error interacting with DposClient:', error);
  }
};

runExample();
