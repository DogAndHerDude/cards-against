import { splitProps, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  class?: string;
  invert?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: ParentComponent<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children", "invert"]);

  return (
    <button
      class={twMerge(
        "px-4 py-1.5 rounded border-2 font-semibold",
        "transition-colors ease-out",
        !local.invert &&
          "border-zinc-800 text-zinc-800 bg-zinc-100 hover:bg-zinc-800 hover:text-zinc-100",
        local.invert &&
          "border-zinc-100 text-zinc-100 bg-zinc-800 hover:bg-zinc-100 hover:text-zinc-800",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </button>
  );
};
