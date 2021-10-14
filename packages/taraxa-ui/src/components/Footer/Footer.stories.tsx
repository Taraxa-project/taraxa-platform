import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import Footer, { FooterProps } from './Footer';

export default {
  title: 'Components/Footer',
  component: Footer,
  argTypes: {
    showLabels: { control: 'bolean' },
    description: { control: 'string' },
    items: { control: 'array' },
    list: { control: 'array' },
  },
} as Meta;

const Template: Story<FooterProps> = (args) => <Footer {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  showLabels: false,
  description:
    'Taraxa is a public ledger platform purpose-built for audit logging of informal transactions. ',
  links: [{ label: 'Privacy Policy' }, { label: 'Terms of Use' }],
  items: [
    { label: 'Send', value: 'send', icon: 'send' },
    { label: 'Discord', value: 'discord', icon: 'discord' },
    { label: 'Twitter', value: 'twitter', icon: 'twitter' },
  ],
};
