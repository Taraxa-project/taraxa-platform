import React from 'react';
import { Meta, Story } from '@storybook/react';
import Label, { LabelProps } from './Label';
import { GreenCircledCheck, NotFound, RedCircledCancel } from '../Icons';

export default {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    icon: { control: HTMLElement },
    variant: { control: 'string' },
    label: { control: 'string' },
  },
} as Meta;

const Template: Story<LabelProps> = (args) => <Label {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'success',
  label: 'Success',
  icon: <GreenCircledCheck />,
};
export const Secondary = Template.bind({});
Secondary.args = { variant: 'secondary', label: 'Info', icon: <NotFound /> };
export const Error = Template.bind({});
Error.args = { variant: 'error', label: 'Failure', icon: <RedCircledCancel /> };
