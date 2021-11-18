import React from 'react';
import { Story, Meta } from '@storybook/react';
import IconCard, { IconCardProps } from './IconCard';

export default {
  title: 'Components/IconCard',
  component: IconCard,
  argTypes: {
    title: { control: 'string' },
    description: { control: 'string' },
    onClickText: { control: 'string' },
  },
} as Meta;

const Template: Story<IconCardProps> = (args) => <IconCard {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Staking',
  description: "Earn rewards while helping to secure Taraxa's network",
  onClickText: 'Get Started',
};
