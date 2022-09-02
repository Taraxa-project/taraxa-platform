import React from 'react';
import { Story, Meta } from '@storybook/react';
import AddressInfo, { AddressInfoProps } from './AddressInfo';
import { TransactionData, TransactionStatus } from '../BlockTable/BlockTable';

export default {
  title: 'Components/AddressInfo',
  component: AddressInfo,
  argTypes: {},
} as Meta;

const Template: Story<AddressInfoProps> = (args) => <AddressInfo {...args} />;

const blockData: TransactionData[] = Array(20).fill({
  txHash: '0x00e193a154...',
  status: TransactionStatus.SUCCESS,
  timestamp: 'string',
  pbftBlock: '529133',
  dagLevel: 'string',
  dagHash: 'string',
  value: '0.000000',
  from: '0xc26f6b31a5...',
  gasLimit: 'string',
  gas: '0.000021',
  gasPrice: 'string',
  to: '0xc3r17b31a5...',
  nonce: 153,
  transactionLink: <span>0x00e193a154...</span>,
  addressLinkFrom: <span>0xc26f6b31a5...</span>,
  addressLinkTo: <span>0xc3r17b31a5...</span>,
});

export const Primary = Template.bind({});
Primary.args = {
  address: '0xc44a4365a805d5f1b9bfc9b0b0328deb5e4b2e91',
  balance: '140000.000000',
  blockData,
  value: '770',
  transactionCount: 240,
  dagBlocks: 302,
  pbftBlocks: 240,
  totalReceived: '2140000.000000',
  totalSent: '2000000.000000',
  fees: '10.000000',
};
