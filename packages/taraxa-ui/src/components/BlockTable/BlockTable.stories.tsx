import React from 'react';
import { Story, Meta } from '@storybook/react';
import BlockTable, {
  BlockTableProps,
  TransactionData,
  TransactionStatus,
} from './BlockTable';

export default {
  title: 'Components/BlockTable',
  component: BlockTable,
  argTypes: {
    color: { control: 'string' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const Template: Story<BlockTableProps> = (args) => <BlockTable {...args} />;

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
  blockData,
};
