import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import Loading, { LoadingProps } from "./Loading";

export default {
  title: "Components/Loading",
  component: Loading,
} as Meta;

const Template: Story<LoadingProps> = (args) => <Loading {...args} />;

export const Primary = Template.bind({});
Primary.args = { show: true };
