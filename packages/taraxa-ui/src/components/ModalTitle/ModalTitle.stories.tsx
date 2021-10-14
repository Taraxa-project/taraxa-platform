import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import ModalTitle, { ModalTitleProps } from "./ModalTitle";

export default {
  title: "Components/ModalTitle",
  component: ModalTitle,
} as Meta;

const Template: Story<ModalTitleProps> = (args) => <ModalTitle {...args} />;

export const Primary = Template.bind({});
Primary.args = { label: "ModalTitle", };