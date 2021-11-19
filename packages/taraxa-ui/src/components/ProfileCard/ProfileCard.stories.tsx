import React from 'react';
import { Story, Meta } from '@storybook/react';
import ProfileCard, { ProfileCardProps } from './ProfileCard';

export default {
  title: 'Components/ProfileCard',
  component: ProfileCard,
} as Meta;

const Template: Story<ProfileCardProps> = (args) => <ProfileCard {...args} />;

export const Primary = Template.bind({});
Primary.args = { username: 'Test', email: 'test@test.com' };
