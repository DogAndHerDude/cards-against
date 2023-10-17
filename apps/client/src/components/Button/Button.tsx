import { splitProps, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  class?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: ParentComponent<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <button
      class={twMerge(
        "px-4 py-1.5 rounded border-2 border-zinc-800 text-zinc-800 font-semibold",
        "transition-colors ease-out",
        "hover:bg-zinc-800 hover:text-zinc-100",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </button>
  );
};
