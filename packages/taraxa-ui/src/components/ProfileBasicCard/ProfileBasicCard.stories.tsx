import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import ProfileBasicCard, { ProfileBasicCardProps } from "./ProfileBasicCard";

export default {
  title: "Components/ProfileBasicCard",
  component: ProfileBasicCard,
} as Meta;

const Template: Story<ProfileBasicCardProps> = (args) => <ProfileBasicCard {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: "Test", value: "41,234", description: "TARA" };
