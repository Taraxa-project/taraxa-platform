import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import InputField, { InputFieldProps } from "./InputField";

export default {
  title: "Components/InputField",
  component: InputField,
} as Meta;

const Template: Story<InputFieldProps> = (args) => <InputField {...args} />;



export const Primary = Template.bind({});
Primary.args = { label:"Test", variant:"outlined" };
