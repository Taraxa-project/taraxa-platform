import React from 'react';
import { Story, Meta } from '@storybook/react';
import { AwardCard, AwardCardProps } from './AwardCard';

export default {
  title: 'Components/AwardCard',
  component: AwardCard,
} as Meta;

const Template: Story<AwardCardProps> = (args) => <AwardCard {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Top nodes for Week 8 2022',
  subtitle: 'Top block producers for Week 8 (FEB 20th - FEB 26th)',
  total: 32124,
  description: 'Total blocks produced this week',
};
