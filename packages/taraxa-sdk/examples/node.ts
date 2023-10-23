import { NetworkName, ProviderType } from '../src';
import { DposClient } from '../src/DposClient';

const runExample = async () => {
  const networkName = NetworkName.MAINNET;
  const privateKey = 'your-private-key'; // Replace with your private key

  const client = new DposClient(networkName, ProviderType.RPC, privateKey);

  try {
    const totalVotes = await client.getTotalEligibleVotesCount();
    console.log('Total Eligible Votes:', totalVotes);

    // Add more interactions as needed
  } catch (error) {
    console.error('Error interacting with DposClient:', error);
  }
};

runExample();
