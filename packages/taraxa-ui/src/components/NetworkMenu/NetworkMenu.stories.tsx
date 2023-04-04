import React from 'react';
import { Story, Meta } from '@storybook/react';
import NetworkMenu from './NetworkMenu';

export default {
  title: 'Components/Network Selection Menu',
  component: NetworkMenu,
} as Meta;

enum Network {
  TESTNET = 'Testnet',
  MAINNET = 'Mainnet',
}

const Template: Story<any> = (args) => <NetworkMenu {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  networks: Object.values(Network),
  currentNetwork: Network.TESTNET,
};
