import React from 'react';
import { Story, Meta } from '@storybook/react';
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
  description:
    'Taraxa is a public ledger platform purpose-built for audit logging of informal transactions. ',
  links: [
    { label: 'Privacy Policy', link: '#' },
    { label: 'Terms of Use', link: '#' },
  ],
  items: [
    { label: 'Send', Icon: <></> },
    { label: 'Discord', Icon: <></> },
    { label: 'Twitter', Icon: <></> },
  ],
};
