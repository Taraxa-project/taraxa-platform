import { DposClient } from '../src/DposClient';

const runExample = async () => {
  const networkName = 'mainnet';
  const privateKey = 'YOUR_PRIVATE_KEY'; // Replace with your private key

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
