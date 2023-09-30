import { Component, For, Show, createRenderEffect, onMount } from "solid-js";
import { useSockets } from "../../utils/SocketProvider";
import { BasicRoom, roomStore } from "./rooms.store";
import { RoomsToolbar } from "./RoomsToolbar";
import { useNavigate } from "@solidjs/router";

export const Rooms: Component = () => {
  const navigate = useNavigate();
  const { rooms, initRooms, addRoom, removeRoom } = roomStore;
  const { emit, on } = useSockets();
  const onCreateRoomClick = async () => {
    const room = await emit<BasicRoom>("CREATE_ROOM");

    addRoom(room);
    navigate(`/game/${room.id}`);
  };
  const onJoinClick = async (id: string) => {
    const room = await emit<BasicRoom>("JOIN_ROOM", { roomId: id });

    navigate(`/game/${room.id}`);
  };

  createRenderEffect(() => {
    emit<BasicRoom[]>("LIST_ROOMS", undefined, (payload) => {
      initRooms(payload);
    });
  });

  onMount(() => {
    on<BasicRoom>("ROOM_CREATED", (payload) => {
      addRoom(payload);
    });
    on<{ roomId: string }>("ROOM_CLOSED", (payload) => {
      removeRoom(payload.roomId);
    });
  });

  return (
    <div class="w-screen h-screen bg-zinc-50">
      <RoomsToolbar onCreateRoomClick={onCreateRoomClick} />

      <Show
        when={!!rooms().length}
        fallback={<p class="text-zinc-900">No rooms found...</p>}
      >
        <For each={rooms()}>
          {(room) => (
            <div class="px-5 py-3 rounded border border-zinc-600">
              <p>{room.id}</p>

              <button onClick={() => onJoinClick(room.id)}>Join</button>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};
