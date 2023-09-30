import { createRoot, createSignal } from "solid-js";
import { BasicRoom } from "../Rooms/rooms.store";
import { createStore } from "solid-js/store";
import type {
  IBlackCard,
  IWhiteCard,
  RoundStartedPayload,
} from "@cards-against/game";

export type GetRoomPayload = {
  round: number;
  players: PlayerPayload[];
} & Omit<BasicRoom, "players">;

export type PlayerPayload = {
  id: string;
  name: string;
  score: number;
};

export type Player = {
  played?: boolean;
} & PlayerPayload;

export type GameStore = {
  round: number;
  players: PlayerPayload[];
  cardCzar?: string;
  blackCard?: IBlackCard;
  roundTimer?: number;
} & Partial<Omit<BasicRoom, "players">>;

export type GameStage = "ROUND_STARTED" | "PICK_STARTED" | "ROUND_ENDED";

function createGameStore() {
  const playerMap = new Map<string, Player>();
  const [gameStage, setGameStage] = createSignal<GameStage>();
  const [cards, setCards] = createStore<IWhiteCard[]>([]);
  const [cardsInPlay, setCardsInPlay] = createSignal<IWhiteCard[][]>([]);
  const [game, setGame] = createStore<GameStore>({
    round: 0,
    players: [] as PlayerPayload[],
    inProgress: false,
  });
  const initRoom = (room: GetRoomPayload) => {
    room.players.forEach((player) => playerMap.set(player.id, player));
    setGame(() => room);
  };
  const addPlayer = (player: PlayerPayload) => {
    if (!playerMap.has(player.id)) {
      playerMap.set(player.id, player);
    }

    setGame({
      ...game,
      players: Array.from(playerMap.values()),
    });
  };
  const removePlayerById = (id: string) => {
    playerMap.delete(id);
    setGame({
      ...game,
      players: Array.from(playerMap.values()),
    });
  };
  const setPlayerPlayed = (id: string) => {
    if (playerMap.has(id)) {
      return;
    }

    (playerMap.get(id) as Player).played = true;
    setGame({
      ...game,
      players: Array.from(playerMap.values()),
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
  const setRoundEnded = () => {
    for (const player of playerMap.values()) {
      player.played = false;
    }

    setGame({
      ...game,
      players: Array.from(playerMap.values()),
    });
  };

  return {
    game,
    cards,
    gameStage,
    initRoom,
    addPlayer,
    removePlayerById,
    setPlayerPlayed,
    setGameStarted,
    setRoundStarted,
    setRoundEnded,
    addCards,
    setGameStage,
    cardsInPlay,
    setCardsInPlay,
  };
}

export const gameStore = createRoot(createGameStore);
