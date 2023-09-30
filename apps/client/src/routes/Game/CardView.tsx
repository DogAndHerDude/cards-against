import { IWhiteCard } from "@cards-against/game";
import { Component, Index, createSignal } from "solid-js";
import { WhiteCard } from "./WhiteCard";
import { twMerge } from "tailwind-merge";

type CardViewProps = {
  pick?: number;
  cards: IWhiteCard[];
};

export const CardView: Component<CardViewProps> = (props) => {
  const [selectedCards, setSelectecCards] = createSignal<string[]>([]);
  const [hoveredCardIndex, setHoveredCardIndex] = createSignal<number>(-1);
  const onCardSelect = (value: string) => {
    if (props.pick === selectedCards.length) {
      return;
    }

    setSelectecCards([...selectedCards(), value]);
  };
  const resolveZIndex = (index: number) => {
    if (!hoveredCardIndex()) {
      return index;
    }

    if (index < hoveredCardIndex()) {
      return index + 1;
    }

    if (index > hoveredCardIndex()) {
      return index === 0 ? 0 : index - 1;
    }

    return 9999;
  };

  return (
    <div class="w-full px-12 overflow-hidden">
      {selectedCards().length === props.pick && <div></div>}

      <div
        class={`min-w-full overflow-x-auto`}
        style={{ width: `${props.cards.length * 72}rem` }}
      >
        <Index each={props.cards}>
          {(card, index) => (
            <WhiteCard
              class={twMerge(
                "absolute",
                selectedCards().includes(card().text) && "-translate-y-6",
              )}
              value={card().text}
              style={{
                left: `${index * 70}px`,
                "z-index": resolveZIndex(index),
              }}
              onClick={onCardSelect}
              onMouseOver={() => {
                setHoveredCardIndex(index);
              }}
              onMouseOut={() => {
                if (index === hoveredCardIndex()) {
                  setHoveredCardIndex(-1);
                }
              }}
            />
          )}
        </Index>
      </div>
    </div>
  );
};
