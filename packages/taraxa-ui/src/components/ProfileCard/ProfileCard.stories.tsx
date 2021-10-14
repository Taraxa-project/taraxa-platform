import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ProfileCard, { ProfileCardProps } from './ProfileCard';

export default {
  title: 'Components/ProfileCard',
  component: ProfileCard,
} as Meta;

const Template: Story<ProfileCardProps> = (args) => <ProfileCard {...args} />;

export const Primary = Template.bind({});
Primary.args = { username: 'Test', email: 'test@test.com' };
