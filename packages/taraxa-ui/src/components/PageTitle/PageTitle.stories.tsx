import React from 'react';
import { Story, Meta } from '@storybook/react';
import PageTitle, { PageTitleProps } from './PageTitle';

export default {
  title: 'Components/Page Title',
  component: PageTitle,
} as Meta;

const Template: Story<PageTitleProps> = (args) => <PageTitle {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Sample title',
  subtitle: 'Sample subtitle thats a bit longer just to check',
};
