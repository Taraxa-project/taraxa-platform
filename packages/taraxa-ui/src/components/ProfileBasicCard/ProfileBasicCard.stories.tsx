import React from 'react';
import { Story, Meta } from '@storybook/react';
import ProfileBasicCard, { ProfileBasicCardProps } from './ProfileBasicCard';

export default {
  title: 'Components/ProfileBasicCard',
  component: ProfileBasicCard,
} as Meta;

const Template: Story<ProfileBasicCardProps> = (args) => (
  <ProfileBasicCard {...args} />
);

export const Primary = Template.bind({});
Primary.args = { title: 'Test', value: '41,234', description: 'TARA' };
