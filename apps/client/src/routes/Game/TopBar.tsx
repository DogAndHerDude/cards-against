import {
  Component,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
} from "solid-js";
import { GameStage, gameStore } from "./game.store";
import { Button } from "../../components/Button/Button";

type TopBarProps = {
  stage?: GameStage;
  onStartClick?(): void;
};

export const TopBar: Component<TopBarProps> = (props) => {
  let interval: NodeJS.Timer;
  const [remainingSeconds, setRemainingSeconds] = createSignal(0);

  createEffect(() => {
    if (gameStore.game.roundTimer && remainingSeconds() === -1) {
      setRemainingSeconds(gameStore.game.roundTimer / 1000);
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

      <Switch fallback={null}>
        <Match when={props.stage === "ROUND_STARTED"}>
          <span class="text-lg font-semibold text-zinc-800">Round started</span>
        </Match>
        <Match when={props.stage === "PICK_STARTED"}>
          <span class="text-lg font-semibold text-zinc-800">
            Czar is picking cards
          </span>
        </Match>
        <Match when={props.stage === "ROUND_ENDED"}>
          <span class="text-lg font-semibold text-zinc-800">
            Wait for next round
          </span>
        </Match>
      </Switch>

      <Button
        class="px-4 py-1.5 rounded border-2 border-zinc-800 font-semibold"
        onClick={props.onStartClick}
      >
        Start game
      </Button>
    </div>
  );
};
