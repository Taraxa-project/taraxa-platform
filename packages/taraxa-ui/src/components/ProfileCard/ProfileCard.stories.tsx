/* eslint-disable no-console */
import React from 'react';
import { Story, Meta } from '@storybook/react';
import ProfileCard, { ProfileCardProps } from './ProfileCard';
import Close from '../Icons/Close';
import Button from '../Button';

export default {
  title: 'Components/ProfileCard',
  component: ProfileCard,
} as Meta;

const Template: Story<ProfileCardProps> = (args) => <ProfileCard {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  username: 'Test',
  email: 'test@test.com',
  Icon: Close,
  wallet: '0x072132312312413312213',
  buttonOptions: (
    <>
      <Button
        color="primary"
        variant="outlined"
        label="Edit Profile"
        fullWidth
        onClick={() => console.log('Edit Profile')}
      />
      <Button
        color="primary"
        variant="text"
        label="Log out"
        fullWidth
        onClick={() => {
          console.log('Log out');
        }}
      />
    </>
  ),
};
