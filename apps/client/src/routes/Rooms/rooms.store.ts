import { createMemo, createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";

export type BasicRoom = {
  id: string;
  players: number;
  inProgress: boolean;
};

type RoomStore = Record<string, BasicRoom>;

function createRoomStore() {
  const [rooms, setRooms] = createStore<RoomStore>({});
  const roomArr = createMemo(() => {
    return Object.keys(rooms).map((key) => rooms[key]);
  });
  const initRooms = (payload: BasicRoom[]) => {
    setRooms(
      produce((store) => {
        for (const entry of payload) {
          store[entry.id] = entry;
        }
      }),
    );
  };
  const addRoom = (payload: BasicRoom) => {
    setRooms(
      produce((store) => {
        store[payload.id] = payload;
      }),
    );
  };

  return { rooms: roomArr, initRooms, addRoom };
}

export const roomStore = createRoot(createRoomStore);
