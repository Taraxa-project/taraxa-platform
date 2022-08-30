import React from 'react';
import { Story, Meta } from '@storybook/react';
import BarChart from './BarChart';

export default {
  title: 'Components/BarChart',
  component: BarChart,
  argTypes: {},
} as Meta;

const Template: Story<any> = (args) => <BarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  labels: ['33366', '33367', '33368', '33369'],
  datasets: [
    {
      data: [10, 50, 100, 25, 30, 25],
      borderRadius: 5,
      barThickness: 20,
      backgroundColor: '#15AC5B',
    },
  ],
  title: 'Transactions per second',
};
