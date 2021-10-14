import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import VerticalRewardCard, { VerticalRewardCardProps } from "./VerticalRewardCard";

export default {
  title: "Components/VerticalRewardCard",
  component: VerticalRewardCard,
  argTypes: {
    title: { control: 'string'},
    description: { control: 'string'},
    onClickText: { control: 'string'}
  },
} as Meta;

const Template: Story<VerticalRewardCardProps> = (args) => <VerticalRewardCard {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: "Staking", description: "Earn rewards while helping to secure Taraxa's network", onClickText: "Get Started" };
