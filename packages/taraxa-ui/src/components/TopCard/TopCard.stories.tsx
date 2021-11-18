import React from 'react';
import { Story, Meta } from '@storybook/react';
import TopCard, { TopCardProps } from './TopCard';

export default {
  title: 'Components/BaseCard',
  component: TopCard,
  argTypes: {
    title: { control: 'string' },
    description: { control: 'string' },
  },
} as Meta;

const Template: Story<TopCardProps> = (args) => <TopCard {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: '0', description: 'TARA Staked' };
