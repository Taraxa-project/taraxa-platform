import React from 'react';
import { Story, Meta } from '@storybook/react';
import {
  TransactionDetails,
  TransactionDetailsProps,
} from './TransactionDetails';

export default {
  title: 'Components/TransactionDetails',
  component: TransactionDetails,
} as Meta;

const Template: Story<TransactionDetailsProps> = (args) => (
  <TransactionDetails {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  level: 525299,
  hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
  transactionsCount: 3,
  timeSince: '44 seconds',
};
