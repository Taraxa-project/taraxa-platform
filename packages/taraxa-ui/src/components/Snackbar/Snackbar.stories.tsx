import React from 'react';
import { Story, Meta } from '@storybook/react';
import Snackbar, { SnackbarProps } from './Snackbar';

export default {
  title: 'Components/Snackbar',
  component: Snackbar,
} as Meta;

const Template: Story<SnackbarProps> = (args) => <Snackbar {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  severity: 'success',
  message: 'Success SNACKBAR IS HERE',
  open: true,
};
export const Info = Template.bind({});
Info.args = { severity: 'info', message: 'INFO SNACKBAR IS HERE', open: true };
export const Warn = Template.bind({});
Warn.args = {
  severity: 'warning',
  message: 'WARNING SNACKBAR IS HERE',
  open: true,
};
export const Error = Template.bind({});
Error.args = {
  severity: 'error',
  message: 'ERROR SNACKBAR IS HERE',
  open: true,
};
