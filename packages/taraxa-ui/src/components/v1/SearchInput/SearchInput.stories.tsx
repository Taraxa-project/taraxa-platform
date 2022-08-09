import React from 'react';
import { Story, Meta } from '@storybook/react';
import SearchInput, { SearchInputProps } from './SearchInput';

export default {
  title: 'v1/Search Input',
  component: SearchInput,
} as Meta;

const Template: Story<SearchInputProps> = (args) => <SearchInput {...args} />;

export const Primary = Template.bind({});
Primary.args = { placeholder: 'Search' };

export const FullWidth = Template.bind({});
FullWidth.args = { fullWidth: true };

export const NoPlaceholder = Template.bind({});
NoPlaceholder.args = {};
