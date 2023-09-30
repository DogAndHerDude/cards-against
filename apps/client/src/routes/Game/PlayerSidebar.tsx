import { Component, For } from "solid-js";
import { PlayerPayload } from "./game.store";

type PlayerSidebarProps = {
  players: PlayerPayload[];
  onLeaveClick?(): void;
};

export const PlayerSidebar: Component<PlayerSidebarProps> = (props) => {
  return (
    <div class="w-72 h-screen fixed border-r border-r-zinc-300 text-zinc-800 bg-zinc-50 flex flex-col justify-between">
      <ul class="list-none w-full">
        <For each={props.players}>
          {(player) => (
            <li class="px-4 py-2 w-full border-b border-zinc-200">
              <p class="text-sm font-bold">{player.name}</p>
              <p class="text-xs text-zinc-600">
                <b>Score:</b> {player.score}
              </p>
            </li>
          )}
        </For>
      </ul>

      <div class="w-full flex items-center justify-center py-4">
        <button
          class="bg-zinc-200 rounded text-zinc-800 px-8 py-2"
          onClick={props.onLeaveClick}
        >
          Leave
        </button>
      </div>
    </div>
  );
};
