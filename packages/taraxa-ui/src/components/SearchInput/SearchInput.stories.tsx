import React from 'react';
import { Story, Meta } from '@storybook/react';
import SearchInput, { SearchInputProps } from './SearchInput';

export default {
  title: 'Components/Search Input',
  component: SearchInput,
} as Meta;

const Template: Story<SearchInputProps> = (args) => <SearchInput {...args} />;

export const Primary = Template.bind({});
Primary.args = { placeholder: 'Search' };

export const Loading = Template.bind({});
Loading.args = {
  placeholder: 'Search',
  open: true,
  loading: true,
};

export const NoResults = Template.bind({});
NoResults.args = {
  placeholder: 'Search',
  open: true,
  options: [],
  onChange: (v) => alert(`You clicked ${v.value}`),
};

export const WithResults = Template.bind({});
WithResults.args = {
  placeholder: 'Search',
  open: true,
  options: [
    { type: 'Address', label: 'Test 1', value: 'test1' },
    { type: 'Address', label: 'Test 2', value: 'test2' },
    { type: 'Address', label: 'Test 3', value: 'test3' },
  ],
  onChange: (v) => alert(`You clicked ${v.value}`),
};

export const FullWidth = Template.bind({});
FullWidth.args = { fullWidth: true };

export const NoPlaceholder = Template.bind({});
NoPlaceholder.args = {};
