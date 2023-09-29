import { useParams } from "@solidjs/router";
import { Component, createRenderEffect, onMount } from "solid-js";
import { useSockets } from "../../utils/SocketProvider";
import { GetRoomPayload, Player, gameStore } from "./game.store";
import { RoundStartedPayload } from "@cards-against/game";
import { PlayerSidebar } from "./PlayerSidebar";
import { authStore } from "../../store/auth.store";

export const Game: Component = () => {
  const {
    game,
    cards,
    initRoom,
    addPlayer,
    removePlayerById,
    setGameStarted,
    setRoundStarted,
    addCards,
  } = gameStore;
  const params = useParams<{ id: string }>();
  const { emit, on } = useSockets();

  createRenderEffect(async () => {
    const result = await emit<GetRoomPayload>("GET_ROOM", {
      roomId: params.id,
    });

    initRoom(result);
  });

  onMount(async () => {
    on<{ user: Player }>("USER_JOINED", (payload) => {
      addPlayer(payload.user);
    });
    on<{ userId: string }>("USER_LEFT", (payload) => {
      removePlayerById(payload.userId);
    });
    on<RoundStartedPayload>("ROUND_STARTED", (payload) => {
      setRoundStarted(payload);
    });
  });

  return (
    <div class="w-screen h-screen bg-zinc-100">
      <PlayerSidebar players={game.players} />
    </div>
  );
};
