import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import Chip, { ChipProps } from "./Chip";

export default {
  title: "Components/Chip",
  component: Chip,
} as Meta;

const Template: Story<ChipProps> = (args) => <Chip {...args} />;

export const Primary = Template.bind({});
Primary.args = { label: "Test" };
