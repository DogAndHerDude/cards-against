import { createRoot } from "solid-js";
import { BasicRoom } from "../Rooms/rooms.store";
import { createStore } from "solid-js/store";
import type {
  IBlackCard,
  IWhiteCard,
  RoundStartedPayload,
} from "@cards-against/game";

export type GetRoomPayload = {
  round: number;
  players: Player[];
} & BasicRoom;

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type GameStore = {
  round: number;
  players: Player[];
  cardCzar?: string;
  blackCard?: IBlackCard;
  cardsInPlay: IWhiteCard[];
  roundTimer?: number;
} & Partial<Omit<BasicRoom, "players">>;

function createGameStore() {
  const [cards, setCards] = createStore<IWhiteCard[]>([]);
  const [game, setGame] = createStore<GameStore>({
    round: 0,
    players: [] as Player[],
    cardsInPlay: [],
    inProgress: false,
  });
  const initRoom = (room: GetRoomPayload) => {
    setGame(() => room);
  };
  const addPlayer = (player: Player) => {
    setGame({
      ...game,
      players: [...game.players, { ...player, score: 0 }],
    });
  };
  const removePlayerById = (id: string) => {
    setGame({
      ...game,
      players: game.players.filter((player) => player.id !== id),
    });
  };
  const setGameStarted = () => {
    setGame({
      ...game,
      inProgress: true,
    });
  };
  const addCards = (incomingCards: IWhiteCard[]) => {
    setCards([...cards, ...incomingCards]);
  };
  const setRoundStarted = (payload: RoundStartedPayload) => {
    setGame({
      ...game,
      ...payload,
    });
  };

  return {
    game,
    cards,
    initRoom,
    addPlayer,
    removePlayerById,
    setGameStarted,
    setRoundStarted,
    addCards,
  };
}

export const gameStore = createRoot(createGameStore);
