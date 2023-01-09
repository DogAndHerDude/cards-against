import { ReactNode } from "react";
import { useAppSelector } from "../../store/hooks";

type TopBarProps = {
  children?: ReactNode;
};

export const TopBar = ({ children }: TopBarProps) => {
  return (
    <header className="px-8 py-4 border-b border-zinc-300">{children}</header>
  );
};
