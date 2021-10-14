import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import BaseCard, { BaseCardProps } from './BaseCard';

export default {
  title: 'Components/BaseCard',
  component: BaseCard,
  argTypes: {
    title: { control: 'string' },
    description: { control: 'string' },
  },
} as Meta;

const Template: Story<BaseCardProps> = (args) => <BaseCard {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: '0', description: 'TARA Staked' };
