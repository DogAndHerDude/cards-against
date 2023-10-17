import { useNavigate, useParams } from "@solidjs/router";
import {
  Component,
  Show,
  createRenderEffect,
  onCleanup,
  onMount,
} from "solid-js";
import { useSockets } from "../../utils/SocketProvider";
import {
  GetRoomPayload,
  PickEndedPayload,
  PickStartedPayload,
  PlayerPayload,
  gameStore,
} from "./game.store";
import { IWhiteCard, RoundStartedPayload } from "@cards-against/game";
import { PlayerSidebar } from "./PlayerSidebar";
import { TopBar } from "./TopBar";
import { GameView } from "./GameView";

export const Game: Component = () => {
  const {
    game,
    gameStage,
    initRoom,
    addPlayer,
    removePlayerById,
    setPlayerPlayed,
    setGameStarted,
    setRoundStarted,
    setPickStarted,
    setRoundEnded,
    addCards,
    setCardsInPlay,
  } = gameStore;
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { emit, on } = useSockets();
  const onLeaveClick = () => {
    emit("LEAVE_ROOM", { roomId: game.id as string });
    navigate("/rooms");
  };
  const onStartClick = () => {
    emit("START_GAME", {
      roomId: game.id as string,
    });
  };
  const onCardPlay = (cards: string[]) => {
    emit("GAME_EVENT", {
      roomId: game.id as string,
      event: "PLAYER_CARD_PLAYED",
      cards,
    });
  };
  const onCardPick = (cards: string[]) => {
    emit("GAME_EVENT", {
      roomId: game.id as string,
      event: "PLAYED_CARD_PICK",
      cards,
    });
  };

  createRenderEffect(async () => {
    const result = await emit<GetRoomPayload>("GET_ROOM", {
      roomId: params.id,
    });

    initRoom(result);
  });

  onMount(async () => {
    on<{ user: PlayerPayload }>("USER_JOINED", (payload) => {
      addPlayer(payload.user);
    });
    on<{ userId: string }>("USER_LEFT", (payload) => {
      removePlayerById(payload.userId);
    });
    on<RoundStartedPayload>("ROUND_STARTED", (payload) => {
      setRoundStarted(payload);
    });
    on<{ whiteCards: IWhiteCard[] }>("HAND_OUT_CARDS", (payload) => {
      addCards(payload.whiteCards);
    });
    on<{ playerID: string }>("PLAYER_CARD_PLAYED", (payload) => {
      setPlayerPlayed(payload.playerID);
    });
    on<{ playedCards: string[][] }>("PLAY_ENDED", (payload) => {
      setCardsInPlay(payload.playedCards);
    });
    on<PickStartedPayload>("PICK_STARTED", (payload) => {
      setPickStarted(payload);
    });
    on<PickEndedPayload>("PICK_ENDED", (payload) => {});
    on("ROUND_ENDED", () => {
      setRoundEnded();
    });
  });

  onCleanup(() => {
    emit("LEAVE_ROOM", { roomId: game.id as string });
  });

  return (
    <div class="w-screen h-screen bg-zinc-100">
      <PlayerSidebar players={game.players} onLeaveClick={onLeaveClick} />

      <div class="relative h-full ml-72">
        <TopBar stage={gameStage()} onStartClick={onStartClick} />

        <Show when={!game.inProgress} fallback={<p>WIP config view</p>}>
          <GameView onCardsPlayed={onCardPlay} onCardsPicked={onCardPick} />
        </Show>
      </div>
    </div>
  );
};
