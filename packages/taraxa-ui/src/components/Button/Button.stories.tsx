import React from 'react';
import { Story, Meta } from '@storybook/react';
import Button, { ButtonProps } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    color: { control: 'string' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = { label: 'Primary', size: 'large' };

export const Secondary = Template.bind({});
Secondary.args = { label: 'Secondary', size: 'large' };
