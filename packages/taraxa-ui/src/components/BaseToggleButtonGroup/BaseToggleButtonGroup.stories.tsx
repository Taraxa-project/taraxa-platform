import React from 'react';
import { Story, Meta } from '@storybook/react';
import BaseToggleButtonGroup, {
  BaseToggleButtonGroupProps,
} from './BaseToggleButtonGroup';

export default {
  title: 'Components/BaseToggleButtonGroup',
  component: BaseToggleButtonGroup,
} as Meta;

const Template: Story<BaseToggleButtonGroupProps> = (args) => (
  <BaseToggleButtonGroup {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  data: [
    { value: '1', label: '2' },
    { value: '2', label: '3' },
  ],
};
