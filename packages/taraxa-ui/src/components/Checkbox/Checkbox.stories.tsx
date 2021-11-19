import React from 'react';
import { Story, Meta } from '@storybook/react';
import Checkbox from './Checkbox';

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
} as Meta;

const Template: Story = (args) => <Checkbox {...args} />;

export const Primary = Template.bind({});
Primary.args = { name: 'Test' };
