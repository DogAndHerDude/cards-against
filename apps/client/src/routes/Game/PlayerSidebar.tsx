import { Component, For } from "solid-js";
import { FaSolidCheck } from "solid-icons/fa";
import { PlayerPayload, gameStore } from "./game.store";
import { Button } from "../../components/Button/Button";

type PlayerSidebarProps = {
  players: PlayerPayload[];
  onLeaveClick?(): void;
};

export const PlayerSidebar: Component<PlayerSidebarProps> = (props) => {
  const { playersPlayed, game } = gameStore;

  return (
    <div class="w-72 h-screen fixed border-r border-r-zinc-300 text-zinc-800 bg-zinc-50 flex flex-col justify-between">
      <ul class="list-none w-full">
        <For each={props.players}>
          {(player) => (
            <li class="px-4 py-2 w-full border-b border-zinc-200 flex justify-between">
              <div>
                <p class="text-sm font-bold">
                  {player.name}
                  {game.cardCzar === player.id && " (Czar)"}
                </p>
                <p class="text-xs text-zinc-600">
                  <b>Score:</b> {player.score}
                </p>
              </div>

              {playersPlayed().includes(player.id) && (
                <FaSolidCheck fill="#16a34a" />
              )}
            </li>
          )}
        </For>
      </ul>

      <div class="w-full flex items-center justify-center py-4">
        <Button
          class="bg-zinc-200 rounded text-zinc-800 px-8 py-2 w-full"
          onClick={props.onLeaveClick}
        >
          Leave
        </Button>
      </div>
    </div>
  );
};
