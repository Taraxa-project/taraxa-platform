import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import Text, { TextProps } from "./Text";

export default {
  title: "Components/Text",
  component: Text,
} as Meta;

const Template: Story<TextProps> = (args) => <Text {...args} />;

export const Primary = Template.bind({});
Primary.args = { label: "Text", };
