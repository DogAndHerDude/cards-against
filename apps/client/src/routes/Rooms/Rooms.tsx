import { Component, For, Show, createRenderEffect, onMount } from "solid-js";
import { useSockets } from "../../utils/SocketProvider";
import { BasicRoom, roomStore } from "./rooms.store";
import { RoomsToolbar } from "./RoomsToolbar";
import { useNavigate } from "@solidjs/router";
import { RoomsContainer } from "./components/RoomsContainer";
import { Button } from "../../components/Button/Button";

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
        fallback={
          <RoomsContainer class="flex flex-col items-center mt-44">
            <p class="text-zinc-900 font-semibold text-lg">No rooms found...</p>
            <p class="text-zinc-900 font-medium text-sm mb-4">
              Go ahead and create one yourself!
            </p>
            <Button onClick={onCreateRoomClick}>Create room</Button>
          </RoomsContainer>
        }
      >
        <RoomsContainer class="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <For each={rooms()}>
            {(room) => (
              <div class="px-5 py-3 rounded border-2 border-zinc-800">
                <h2 class="text-lg font-semibold text-zinc-800 mb-4">
                  {room.id}
                </h2>

                <Button
                  class="w-full text-center"
                  onClick={() => onJoinClick(room.id)}
                >
                  Join
                </Button>
              </div>
            )}
          </For>
        </RoomsContainer>
      </Show>
    </div>
  );
};
