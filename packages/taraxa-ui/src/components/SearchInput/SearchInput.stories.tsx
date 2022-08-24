import React from 'react';
import { Story, Meta } from '@storybook/react';
import SearchInput, { SearchInputProps } from './SearchInput';

export default {
  title: 'Components/Search Input',
  component: SearchInput,
} as Meta;

const Template: Story<SearchInputProps> = (args) => <SearchInput {...args} />;

const onInputChange = (searchStr: string) => {
  // eslint-disable-next-line no-console
  console.log('onInputChange search value: ', searchStr);
};
export const Primary = Template.bind({});
Primary.args = { placeholder: 'Search', onInputChange };

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
};

export const FullWidth = Template.bind({});
FullWidth.args = { fullWidth: true };

export const NoPlaceholder = Template.bind({});
NoPlaceholder.args = {};
