import { useNavigate, useParams } from "@solidjs/router";
import {
  Component,
  Show,
  createRenderEffect,
  onCleanup,
  onMount,
} from "solid-js";
import { useSockets } from "../../utils/SocketProvider";
import { GetRoomPayload, PlayerPayload, gameStore } from "./game.store";
import { IWhiteCard, RoundStartedPayload } from "@cards-against/game";
import { PlayerSidebar } from "./PlayerSidebar";
import { TopBar } from "./TopBar";
import { GameView } from "./GameView";

export const Game: Component = () => {
  const {
    game,
    cards,
    gameStage,
    initRoom,
    addPlayer,
    removePlayerById,
    setPlayerPlayed,
    setGameStarted,
    setRoundStarted,
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
  const onCardPlay = (cards: IWhiteCard[]) => {
    emit("GAME_EVENT", {
      roomId: game.id as string,
      event: "PLAY_CARD",
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
    on<{ playedCards: IWhiteCard[][] }>("PLAY_ENDED", (payload) => {
      setCardsInPlay(payload.playedCards);
    });
  });

  onCleanup(() => {
    emit("LEAVE_ROOM", { roomId: game.id as string });
  });

  return (
    <div class="w-screen h-screen bg-zinc-100">
      <PlayerSidebar players={game.players} onLeaveClick={onLeaveClick} />

      <div class="relative h-full ml-72">
        <TopBar onStartClick={onStartClick} />

        <Show when={!game.inProgress} fallback={<p>WIP config view</p>}>
          <GameView />
        </Show>
      </div>
    </div>
  );
};
