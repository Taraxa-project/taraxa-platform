import React from 'react';
import { Story, Meta } from '@storybook/react';
import Header, { HeaderProps } from './Header';
import { Taraxa } from '../Icons';
import Button from '../Button';
import NetworkMenu from '../NetworkMenu/NetworkMenu';

export default {
  title: 'Components/Header',
  component: Header,
  argTypes: {
    title: { control: 'string' },
  },
} as Meta;

const Template: Story<HeaderProps> = (args) => <Header {...args} />;

enum Network {
  TESTNET = 'Californicum Testnet',
  MAINNET = 'Mainnet Candidate',
}

export const Primary = Template.bind({});
Primary.args = {
  title: 'Taraxa Explorer',
  Icon: Taraxa,
};

export const WithNav = Template.bind({});
WithNav.args = {
  title: 'Taraxa Explorer',
  withSearch: true,
  Icon: Taraxa,
  children: (
    <>
      <Button label='DAG' />
      <Button label='Blocks' />
      <Button label='Transactions' />
      <Button label='Nodes' />
      <Button label='Faucet' />
      <NetworkMenu
        networks={Object.values(Network)}
        currentNetwork={Network.TESTNET}
        horizontalPosition='right'
      />
    </>
  ),
};
