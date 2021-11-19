import React from 'react';
import { Story, Meta } from '@storybook/react';
import LoadingWidget, { LoadingWidgetProps } from './LoadingWidget';

export default {
  title: 'Components/LoadingWidget',
  component: LoadingWidget,
  argTypes: {
    isLoading: { control: 'boolean' },
    widgetId: { control: 'string' },
    progressId: { control: 'string' },
  },
} as Meta;

const Template: Story<LoadingWidgetProps> = (args) => <LoadingWidget {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  isLoading: true,
  widgetId: 'loadingWidgetId',
  progressId: 'progressWidgetId',
};
