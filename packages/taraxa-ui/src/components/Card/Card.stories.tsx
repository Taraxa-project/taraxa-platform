import React from 'react';
import { Story, Meta } from '@storybook/react';
import Card, { CardProps } from './Card';

export default {
  title: 'v1/Card',
  component: Card,
  argTypes: {
    actions: { control: 'string' },
    className: { control: 'string' },
    children: { control: 'string' },
  },
} as Meta;

const Template: Story<CardProps> = (args) => <Card {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
