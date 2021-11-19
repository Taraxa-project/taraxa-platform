import React from 'react';
import { Story, Meta } from '@storybook/react';
import Radio, { RadioProps } from './Radio';

export default {
  title: 'Components/Radio',
  component: Radio,
} as Meta;

const Template: Story<RadioProps> = (args) => <Radio {...args} />;

export const Primary = Template.bind({});
Primary.args = { name: 'Test' };
