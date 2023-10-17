import { Component, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  class?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: Component<ButtonProps> = (props) => {
  const shidd = splitProps(props, [""]);
  return (
    <button
      class={twMerge(
        "px-4 py-1.5 rounded border-2 border-zinc-800 font-semibold",
      )}
      onClick={props.onStartClick}
    >
      Start game
    </button>
  );
};
