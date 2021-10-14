import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
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
