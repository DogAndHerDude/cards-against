import { useField } from "formik";
import { DetailedHTMLProps, InputHTMLAttributes, useMemo } from "react";
import { twMerge } from "tailwind-merge";

type DefaultInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
type InputComponentProps = DefaultInputProps & { name: string };

export const Input = ({ className, ...props }: InputComponentProps) => {
  const [field, meta, helpers] = useField(props.name);

  return (
    <input
      className={twMerge(
        "border border-slate-700 rounded-md px-3 py-2",
        className ?? ""
      )}
      {...field}
      {...props}
    />
  );
};
