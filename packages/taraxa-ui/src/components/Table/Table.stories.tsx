import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import Table, { TableProps } from './Table';

export default {
  title: 'Components/Table',
  component: Table,
} as Meta;

const columns = [
  { path: 'username', name: 'username' },
  { path: 'wallet', name: 'wallet' },
  { path: 'date', name: 'date' },
];

const rows = [
  {
    data: [
      {
        username: 'username43',
        wallet: '0x2612b77E5ee1b5feeDdD5eC08731749bC2217F54',
        date: new Date(),
      },
    ],
  },
  {
    data: [
      {
        username: 'username43',
        wallet: '0x2612b77E5ee1b5feeDdD5eC08731749bC2217F54',
        date: new Date(),
      },
    ],
  },
  {
    data: [
      {
        username: 'username43',
        wallet: '0x2612b77E5ee1b5feeDdD5eC08731749bC2217F54',
        date: new Date(),
      },
    ],
  },
  {
    data: [
      {
        username: 'username43',
        wallet: '0x2612b77E5ee1b5feeDdD5eC08731749bC2217F54',
        date: new Date(),
      },
    ],
  },
  {
    data: [
      {
        username: 'username43',
        wallet: '0x2612b77E5ee1b5feeDdD5eC08731749bC2217F54',
        date: new Date(),
      },
    ],
  },
  {
    data: [
      {
        username: 'username43',
        wallet: '0x2612b77E5ee1b5feeDdD5eC08731749bC2217F54',
        date: new Date(),
      },
    ],
  },
];

const Template: Story<TableProps> = (args) => <Table {...args} />;

export const Primary = Template.bind({});
Primary.args = { columns: columns, rows: rows };
