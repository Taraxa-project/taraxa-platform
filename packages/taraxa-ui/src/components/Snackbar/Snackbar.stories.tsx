import React from 'react';
import { Story, Meta } from '@storybook/react';
import Snackbar, { SnackbarProps } from './Snackbar';

export default {
  title: 'Components/Snackbar',
  component: Snackbar,
} as Meta;

const Template: Story<SnackbarProps> = (args) => <Snackbar {...args} />;

export const Primary = Template.bind({});
Primary.args = { severity: 'info', message: 'TEST' };
