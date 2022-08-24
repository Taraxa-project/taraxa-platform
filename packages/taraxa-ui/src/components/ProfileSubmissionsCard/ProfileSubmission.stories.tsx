import React from 'react';
import { Story, Meta } from '@storybook/react';
import ProfileSubmissionsCard, {
  ProfileSubmissionsCardProps,
} from './ProfileSubmissionsCard';
import Close from '../Icons/Close';

export default {
  title: 'Components/ProfileSubmissionsCard',
  component: ProfileSubmissionsCard,
  argTypes: {
    title: { control: 'string' },
    tooltip: { control: React.Component },
    itemsContent: { control: React.Component },
  },
} as Meta;

const Template: Story<ProfileSubmissionsCardProps> = (args) => (
  <ProfileSubmissionsCard {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  title: 'Sample title',
  tooltip: <Close />,
  itemsContent: <p> Some content</p>,
};
