import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => {
  const [local, other] = splitProps(props, ["class"]);

  return (
    <input
      class={twMerge("px-4 py-2 rounded-md font-semibold text-sm", local.class)}
      {...other}
    />
  );
};
