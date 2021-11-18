import React from 'react';
import { Story, Meta } from '@storybook/react';
import RewardCard, { RewardCardProps } from './RewardCard';

export default {
  title: 'Components/RewardCard',
  component: RewardCard,
  argTypes: {
    title: { control: 'string' },
    description: { control: 'string' },
    onClickText: { control: 'string' },
  },
} as Meta;

const Template: Story<RewardCardProps> = (args) => <RewardCard {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Staking',
  description: "Earn rewards while helping to secure Taraxa's network",
  onClickText: 'Get Started',
};
