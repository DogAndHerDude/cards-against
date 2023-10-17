import { Component, createEffect, createSignal } from "solid-js";
import { gameStore } from "./game.store";
import { Button } from "../../components/Button/Button";

type TopBarProps = {
  onStartClick?(): void;
};

export const TopBar: Component<TopBarProps> = (props) => {
  let interval: NodeJS.Timer;
  //const { game } = gameStore;
  const game = { roundTimer: 60 };
  const [remainingSeconds, setRemainingSeconds] = createSignal(0);

  createEffect(() => {
    if (game.roundTimer) {
      setRemainingSeconds(game.roundTimer / 1000);
      interval = setInterval(() => {
        if (remainingSeconds() === 0) {
          clearInterval(interval);
          return;
        }
        setRemainingSeconds(remainingSeconds() - 1);
      }, 1000);
    }
  });

  return (
    <div class="w-full flex justify-between items-center border-b border-zinc-300 px-4 py-2">
      <div>
        <p class="font-semibold text-zinc-800">{remainingSeconds()}</p>
      </div>

      <Button
        class="px-4 py-1.5 rounded border-2 border-zinc-800 font-semibold"
        onClick={props.onStartClick}
      >
        Start game
      </Button>
    </div>
  );
};
