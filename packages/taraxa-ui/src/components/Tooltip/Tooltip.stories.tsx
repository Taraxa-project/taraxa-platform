import React from 'react';
import { Story, Meta } from '@storybook/react';
import Tooltip, { TooltipProps } from './Tooltip';
import Close from '../Icons/Close';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
} as Meta;

const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: 'Test', Icon: Close, id: '1' };
