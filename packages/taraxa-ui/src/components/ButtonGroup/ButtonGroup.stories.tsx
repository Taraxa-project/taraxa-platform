import React from 'react';
import { Story, Meta } from '@storybook/react';
import ButtonGroup, { ButtonGroupProps } from './ButtonGroup';
import Button from '../Button/Button';

export default {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    color: { control: 'string' },
  },
} as Meta;

const Template: Story<ButtonGroupProps> = (args) => <ButtonGroup {...args} />;

export const Contained = Template.bind({});
Contained.args = {
  variant: 'contained',
  color: 'primary',
  children: (
    <>
      <Button label='One' />
      <Button label='Two' />
      <Button label='Three' />
    </>
  ),
};

export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
  color: 'primary',
  children: (
    <>
      <Button label='One' />
      <Button label='Two' />
      <Button label='Three' />
    </>
  ),
};

export const Text = Template.bind({});
Text.args = {
  variant: 'text',
  color: 'primary',
  children: (
    <>
      <Button label='One' />
      <Button label='Two' />
      <Button label='Three' />
    </>
  ),
};
