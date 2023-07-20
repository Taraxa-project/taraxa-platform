import React from 'react';
import { Story, Meta } from '@storybook/react';
import ProgressBar from './ProgressBar';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: { percentage: { control: 'number' } },
} as Meta;

const Template: Story<any> = (args) => <ProgressBar {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  percentage: 75,
};
