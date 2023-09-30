import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

type WhiteCardProps = {
  value: string;
  inPlay?: boolean;
  class?: string;
  // because storybook messes with types
  style?: any;
  onClick?(value: string): void;
  onMouseOver?: any;
  onMouseOut?: any;
};

export const WhiteCard: Component<WhiteCardProps> = (props) => {
  return (
    <div
      style={props.style}
      class={twMerge(
        "w-72 h-96 px-5 py-5 bg-white text-zinc-800 text-xl font-bold rounded-md shadow-lg cursor-pointer origin-bottom transition-transform duration-300",
        props.inPlay && "hover:scale-110 hover:shadow-xl",
        !props.inPlay && "hover:-translate-y-12",
        props.class,
      )}
      onClick={() => props.onClick?.(props.value)}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
    >
      {props.value}
    </div>
  );
};
