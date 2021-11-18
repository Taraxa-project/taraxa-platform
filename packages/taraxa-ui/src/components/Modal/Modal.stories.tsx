import React from 'react';
import { Story, Meta } from '@storybook/react';
import Modal, { ModalProps } from './Modal';

export default {
  title: 'Components/Modal',
  component: Modal,
} as Meta;

const Template: Story<ModalProps> = (args) => <Modal {...args} />;

export const Primary = Template.bind({});
Primary.args = { show: true };
