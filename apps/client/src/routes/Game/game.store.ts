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

export type PickStartedPayload = {
  pickTimer: number;
};

export type PickEndedPayload = {
  playerID: string;
  winningCard: string[];
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

// HUGE NOTE!
// This store is a big shit
// Needs a complete rewrite
// I'm just using this until I get the gist of the structure
//  and a general understanding of SolidJS
function createGameStore() {
  const [gameStage, setGameStage] = createSignal<GameStage>();
  const [cards, setCards] = createStore<IWhiteCard[]>([]);
  const [cardsInPlay, setCardsInPlay] = createSignal<string[][]>([]);
  const [playersPlayed, setPlayersPlayed] = createSignal<string[]>([]);
  const [winningCards, setWinningCards] = createSignal<string[]>([]);
  const [game, setGame] = createStore<GameStore>({
    round: 0,
    players: [] as PlayerPayload[],
    inProgress: false,
  });
  const initRoom = (room: GetRoomPayload) => {
    setGame(() => room);
  };
  const addPlayer = (player: PlayerPayload) => {
    const exists = game.players.some((entry) => entry.id === player.id);

    setGame({
      ...game,
      players: exists ? game.players : [...game.players, player],
    });
  };
  const removePlayerById = (id: string) => {
    setGame({
      ...game,
      players: game.players.filter((player) => player.id !== id),
    });
  };
  const setPlayerPlayed = (id: string) => {
    setPlayersPlayed([...playersPlayed(), id]);
  };
  const setGameStarted = () => {
    setGame({
      ...game,
      inProgress: true,
    });
  };
  const addCards = (incomingCards: IWhiteCard[]) => {
    // The server takes care of the merge
    // we just set the new state
    setCards(incomingCards);
  };
  const setRoundStarted = (payload: RoundStartedPayload) => {
    setCardsInPlay([]);
    setGame({
      ...game,
      ...payload,
    });
    setGameStage("ROUND_STARTED");
  };
  const setPickStarted = (payload: PickStartedPayload) => {
    // TODO: set pick timer
    // TODO: refactor game object to account for all kinds of timers
    setGame({
      ...game,
      roundTimer: undefined,
    });
    setGameStage("PICK_STARTED");
  };
  const setPickEnded = (payload: PickEndedPayload) => {
    setWinningCards(payload.winningCard);
    setGame({
      ...game,
      players: game.players.map((player) => {
        if (player.id !== payload.playerID) {
          return player;
        }

        return {
          ...player,
          score: player.score + 1,
        };
      }),
    });
  };
  const setRoundEnded = () => {
    setPlayersPlayed([]);
    setGameStage("ROUND_ENDED");
  };

  return {
    game,
    cards,
    gameStage,
    playersPlayed,
    winningCards,
    initRoom,
    addPlayer,
    removePlayerById,
    setPlayerPlayed,
    setGameStarted,
    setRoundStarted,
    setPickStarted,
    setPickEnded,
    setRoundEnded,
    addCards,
    setGameStage,
    cardsInPlay,
    setCardsInPlay,
  };
}

export const gameStore = createRoot(createGameStore);
