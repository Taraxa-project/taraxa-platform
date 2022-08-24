import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Input } from '@mui/material';
import Modal, { ModalProps } from './Modal';
import Close from '../Icons/Close';

export default {
  title: 'Components/Modal',
  component: Modal,
} as Meta;

const Template: Story<ModalProps> = (args) => <Modal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  show: true,
  title: 'Sample Modal',
  children: (
    <div
      style={{
        width: '350px',
        height: '350px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <h3>Sample Modal</h3>
      <Input placeholder='Sample input' />
      <div>Sample Text. Taraxa.</div>
    </div>
  ),
  parentElementID: 'root',
  onRequestClose: () => {
    // eslint-disable-next-line no-console
    console.log('close');
  },
  id: 'modal-2',
  closeIcon: Close,
};
