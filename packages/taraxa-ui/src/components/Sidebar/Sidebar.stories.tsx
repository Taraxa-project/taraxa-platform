import React from 'react';
import { Story, Meta } from '@storybook/react';
import Sidebar, { SidebarProps } from './Sidebar';

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  argTypes: {
    disablePadding: { control: 'bolean' },
    dense: { control: 'boolean' },
    items: { control: 'array' },
  },
} as Meta;

const Template: Story<SidebarProps> = (args) => <Sidebar {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  disablePadding: true,
  dense: true,
  items: [
    { name: 'home', label: 'Home' },
    {
      name: 'billing',
      label: 'Billing',
      items: [
        { name: 'statements', label: 'Statements' },
        { name: 'reports', label: 'Reports' },
      ],
    },
    {
      name: 'settings',
      label: 'Settings',
      items: [{ name: 'profile', label: 'Profile' }],
    },
  ],
};
