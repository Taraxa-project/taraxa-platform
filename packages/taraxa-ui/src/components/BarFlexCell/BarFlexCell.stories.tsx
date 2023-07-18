import React from 'react';
import { Story, Meta } from '@storybook/react';
import BarFlexCell from './BarFlexCell';

export default {
  title: 'Components/BarFlexCell',
  component: BarFlexCell,
  argTypes: { percentage: { control: 'number' } },
} as Meta;

const Template: Story<any> = (args) => <BarFlexCell {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  percentage: 68.5554332,
};
