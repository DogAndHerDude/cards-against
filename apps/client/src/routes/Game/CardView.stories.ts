import type { Meta, StoryObj } from "storybook-solidjs";
import { CardView } from "./CardView";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: "CardView",
  component: CardView,
  tags: ["autodocs"],
} satisfies Meta<typeof CardView>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Basic: Story = {
  args: {
    cards: [
      {
        text: "Card 1",
      },
      {
        text: "Card 2",
      },
      {
        text: "Card 3",
      },
      {
        text: "Card 4",
      },
    ],
  },
};
