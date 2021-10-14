import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ToggleButton, { ToggleButtonProps } from './ToggleButton';

export default {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  argTypes: {
    color: { control: 'string' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const Template: Story<ToggleButtonProps> = (args) => <ToggleButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  data: [
    { value: '1', label: '2' },
    { value: '1', label: '2' },
  ],
};
