import { IWhiteCard } from "@cards-against/game";
import { Component, Index, createSignal } from "solid-js";
import { WhiteCard } from "./WhiteCard";
import { twMerge } from "tailwind-merge";
import { GameStage } from "./game.store";

type CardViewProps = {
  stage?: GameStage;
  pick?: number;
  cards: IWhiteCard[];
  played: boolean;
  onCardsPlayed(cards: string[]): void;
};

export const CardView: Component<CardViewProps> = (props) => {
  const [selectedCards, setSelectedCards] = createSignal<string[]>([]);
  const onCardSelect = (value: string) => {
    if (
      props.played ||
      props.pick === selectedCards.length ||
      props.stage !== "ROUND_STARTED"
    ) {
      return;
    }

    if (selectedCards().includes(value)) {
      setSelectedCards(selectedCards().filter((card) => card !== value));
      return;
    }

    setSelectedCards([...selectedCards(), value]);
  };
  const onConfirmSelection = () => {
    props.onCardsPlayed(selectedCards());
    setSelectedCards([]);
  };

  return (
    <div class="w-full px-12 overflow-hidden py-20">
      <div
        class={`min-w-full overflow-x-auto`}
        style={{ width: `${props.cards.length * 72}rem` }}
      >
        <Index each={props.cards}>
          {(card, index) => (
            <WhiteCard
              class={twMerge(
                "absolute hover:-translate-y-6 hover:z-[9000]",
                selectedCards().includes(card().text) && "-translate-y-12",
              )}
              value={card().text}
              style={{
                left: `${index * 70}px`,
              }}
              onClick={onCardSelect}
            />
          )}
        </Index>
      </div>

      <div
        class={twMerge(
          "absolute bottom-0 left-0 w-full py-3 bg-zinc-800 flex items-center justify-center ease-out transition-all translate-y-2 opacity-0 z-[9999]",
          props.stage === "ROUND_STARTED" &&
            !props.played &&
            props.pick !== undefined &&
            selectedCards().length === props.pick &&
            "opacity-100 translate-y-0",
        )}
      >
        <button
          class="text-zinc-100 uppercase font-semibold"
          onClick={onConfirmSelection}
        >
          Confirm selection
        </button>
      </div>
    </div>
  );
};
