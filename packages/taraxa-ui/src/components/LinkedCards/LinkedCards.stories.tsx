import React from 'react';
import { Story, Meta } from '@storybook/react';
import LinkedCards, { LinkedCardsProps } from './LinkedCards';

export default {
  title: 'Components/LinkedCards',
  component: LinkedCards,
} as Meta;

const Template: Story<LinkedCardsProps> = (args) => <LinkedCards {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: 'Test' };
