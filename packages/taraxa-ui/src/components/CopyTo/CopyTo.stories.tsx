import React from 'react';
import { Story, Meta } from '@storybook/react';
import CopyTo, { CopyToProps } from './CopyTo';

export default {
  title: 'Components/CopyTo',
  component: CopyTo,
  argTypes: {
    text: { control: 'string' },
    onCopy: { control: 'string' },
  },
} as Meta;

const Template: Story<CopyToProps> = (args) => <CopyTo {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  text: 'This is copied!',
  onCopy: () => {
    // eslint-disable-next-line no-console
    console.log('COPY WORKS!');
  },
};
