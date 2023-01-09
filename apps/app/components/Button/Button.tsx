import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";

export const Button = ({
  className,
  children,
  ...props
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) => {
  return (
    <button
      className={twMerge(
        "border px-5 py-2 rounded-lg bg-slate-800 text-slate-100 text-sm",
        className ?? ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};
