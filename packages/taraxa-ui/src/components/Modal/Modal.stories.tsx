import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import Modal, { ModalProps } from "./Modal";

export default {
  title: "Components/Modal",
  component: Modal,
} as Meta;

const Template: Story<ModalProps> = (args) => <Modal {...args} />;

const example = () => {
  return (
    <p>Hello</p>
  )
}

export const Primary = Template.bind({});
Primary.args = { show: true };
