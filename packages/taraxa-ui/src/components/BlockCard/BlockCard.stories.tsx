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
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
    transactionsCount: 3,
    timeSince: '44 seconds',
  },
  {
    level: 525299,
    hash: '0xdbc8ec105e36519c7f3cb3bbaff4f5662e96b8e42fbe5761a3c11d8efe9974ac',
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
