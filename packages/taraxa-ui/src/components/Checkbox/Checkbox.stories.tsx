import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import Checkbox from './Checkbox';

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
} as Meta;

const Template: Story = (args) => <Checkbox {...args} />;

export const Primary = Template.bind({});
Primary.args = { name: 'Test' };
