import React from 'react';
import { Story, Meta } from '@storybook/react';
import LoadingTable, { LoadingTableProps } from './LoadingTable';

export default {
  title: 'Components/LoadingTable',
  component: LoadingTable,
  argTypes: {
    rows: { control: 'number' },
    cols: { control: 'number' },
    tableWidth: { control: 'string' },
  },
} as Meta;

const Template: Story<LoadingTableProps> = (args) => <LoadingTable {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  rows: 7,
  cols: 10,
  tableWidth: '100%',
};
