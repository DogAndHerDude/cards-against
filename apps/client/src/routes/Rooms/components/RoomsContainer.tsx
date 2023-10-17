import { type ParentComponent, type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

export const RoomsContainer: ParentComponent<
  JSX.HTMLAttributes<HTMLElement>
> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <section class={twMerge("px-8 py-6", local.class)} {...others}>
      {local.children}
    </section>
  );
};
