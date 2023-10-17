import type { Component, JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

type WhiteCardProps = {
  value: string;
  class?: string;
  style?: JSX.HTMLAttributes<HTMLDivElement>["style"];
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
