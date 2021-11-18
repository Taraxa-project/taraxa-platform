import React from 'react';
import { Story, Meta } from '@storybook/react';
import Text, { TextProps } from './Text';

export default {
  title: 'Components/Text',
  component: Text,
} as Meta;

const Template: Story<TextProps> = (args) => <Text {...args} />;

export const Primary = Template.bind({});
Primary.args = { label: 'Text' };
