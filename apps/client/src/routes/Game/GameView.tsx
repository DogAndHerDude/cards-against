import { Component, For, Show, createSignal } from "solid-js";
import { gameStore } from "./game.store";
import { BlackCard } from "./BlackCard";
import { CardView } from "./CardView";
import { WhiteCard } from "./WhiteCard";
import { authStore } from "../../store/auth.store";
import { twMerge } from "tailwind-merge";

type GameViewProps = {
  onCardsPicked(cards: string[]): void;
  onCardsPlayed(cards: string[]): void;
};

export const GameView: Component<GameViewProps> = (props) => {
  const { game, cards, gameStage, playersPlayed, cardsInPlay, winningCards } =
    gameStore;
  const { auth } = authStore;
  const [hoveredSelection, setHoveredSelection] = createSignal<
    number | undefined
  >();
  const hasUserPlayed = () =>
    !!auth.user?.id && playersPlayed().includes(auth.user.id);
  const playerIsCardCzar = () =>
    !!auth.user?.id && game.cardCzar === auth.user.id;

  return (
    <div class="w-full h-full px-5 py-3">
      <div class="flex gap-2">
        <div class="h-full">
          {game.blackCard && <BlackCard value={game.blackCard.text} />}
        </div>

        <ul class="flex gap-2">
          <For each={cardsInPlay()}>
            {(cards, parentIndex) => {
              const cardsWon = cards.every((card) =>
                winningCards().includes(card),
              );

              return (
                <li
                  onMouseOver={() => setHoveredSelection(parentIndex())}
                  onMouseOut={() => setHoveredSelection(undefined)}
                >
                  <For each={cards}>
                    {(entry, index) => {
                      const style =
                        index() > 0
                          ? {
                              style: {
                                position: "absolute" as const,
                                left:
                                  hoveredSelection() === undefined
                                    ? `${10 * index()}px`
                                    : `${100 * index()}%`,
                              },
                            }
                          : {};

                      return (
                        <WhiteCard
                          {...style}
                          class={twMerge(
                            "transition-transform ease-out",
                            cardsWon && "bg-slate-800 text-zinc-100",
                          )}
                          value={entry}
                          onClick={() => {
                            if (
                              !playerIsCardCzar() ||
                              gameStage() !== "PICK_STARTED"
                            ) {
                              return;
                            }

                            props.onCardsPicked(cards);
                          }}
                        />
                      );
                    }}
                  </For>
                </li>
              );
            }}
          </For>
        </ul>
      </div>

      <Show
        when={game.cardCzar && game.cardCzar !== auth.user?.id}
        fallback={null}
      >
        <CardView
          stage={gameStage()}
          cards={cards}
          played={hasUserPlayed()}
          pick={gameStore.game.blackCard?.pick}
          onCardsPlayed={props.onCardsPlayed}
        />
      </Show>
    </div>
  );
};
