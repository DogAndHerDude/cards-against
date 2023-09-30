import { Component } from "solid-js";
import { gameStore } from "./game.store";
import { BlackCard } from "./BlackCard";
import { CardView } from "./CardView";
import { IWhiteCard } from "@cards-against/game";

type GameViewProps = {
  onCardsPlayed(cards: IWhiteCard[]): void;
};

export const GameView: Component<GameViewProps> = (props) => {
  const { game, cards } = gameStore;

  return (
    <div class="w-full h-full px-5 py-3">
      <div>{game.blackCard && <BlackCard value={game.blackCard.text} />}</div>

      <CardView cards={cards} />
    </div>
  );
};
