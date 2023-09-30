import { Component } from "solid-js";

type BlackCardProps = {
  value: string;
};

export const BlackCard: Component<BlackCardProps> = (props) => {
  return (
    <div class="w-72 h-96 px-5 py-5 bg-zinc-800 text-zinc-50 text-xl font-bold rounded-md shadow-lg cursor-pointer hover:scale-105 hover:shadow-xl transition-transform duration-300">
      {props.value}
    </div>
  );
};
