import React from 'react';
import { Story, Meta } from '@storybook/react';
import {
  TransactionDetails,
  TransactionDetailsProps,
} from './TransactionDetails';

export default {
  title: 'Components/TransactionDetails',
  component: TransactionDetails,
  argTypes: {
    title: { control: 'string' },
    description: { control: 'string' },
    onClickText: { control: 'string' },
  },
} as Meta;

const Template: Story<TransactionDetailsProps> = (args) => (
  <TransactionDetails {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  level: 525299,
  hash: '0xdceebbf97e7483ca7d6daf00feddfcfd847dce2649337f088b413vsefq3',
  transactionsCount: 3,
  timeSince: '44 seconds',
};
