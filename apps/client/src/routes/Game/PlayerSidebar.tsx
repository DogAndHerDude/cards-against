import { Component, For } from "solid-js";
import { Player } from "./game.store";

type PlayerSidebarProps = {
  players: Player[];
};

export const PlayerSidebar: Component<PlayerSidebarProps> = (props) => {
  return (
    <div class="w-72 h-screen fixed border-r border-r-zinc-300 text-zinc-800 shadow bg-zinc-50">
      <ul class="list-nonea w-full">
        <For each={props.players}>
          {(player) => (
            <li class="px-4 py-2 w-full border-b border-zinc-300">
              <p class="text-sm">{player.name}</p>
              <p class="text-xs text-zinc-600">
                <b>Score:</b> {player.score}
              </p>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
