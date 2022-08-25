import React from 'react';
import { Story, Meta } from '@storybook/react';
import { BlockCard, BlockCardProps } from './BlockCard';

export default {
  title: 'Components/BlockCard',
  component: BlockCard,
} as Meta;

const transactions = [
  {
    level: 525299,
    hash: '0xdceebbf97e7483ca7d6daf00feddfcfd847dce2649337f088b413vsefq3',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdceebbf97e7483ca7d6daf00feddfcfd847dce2649337f088b413vsefq3',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdceebbf97e7483ca7d6daf00feddfcfd847dce2649337f088b413vsefq3',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdceebbf97e7483ca7d6daf00feddfcfd847dce2649337f088b413vsefq3',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdceebbf97e7483ca7d6daf00feddfcfd847dce2649337f088b413vsefq3',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdceebbf97e7483ca7d6daf00feddfcfd847dce2649337f088b413vsefq3',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
];

const Template: Story<BlockCardProps> = (args) => <BlockCard {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'DAG Blocks',
  transactions,
};
