import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState, store } from "../store";

export type RoomListEntity = {
  id: string;
  players: number;
  inProgress: boolean;
};

const roomsAdapter = createEntityAdapter<RoomListEntity>();

const roomsSlice = createSlice({
  name: "rooms",
  initialState: roomsAdapter.getInitialState(),
  reducers: {
    addRoom(state, action: PayloadAction<RoomListEntity>) {
      roomsAdapter.upsertOne(state, action.payload);
    },
    upsertRooms(state, action: PayloadAction<RoomListEntity[]>) {
      roomsAdapter.upsertMany(state, action.payload);
    },
  },
});

const roomsSelectors = roomsAdapter.getSelectors<RootState>(
  (state) => state.rooms
);

export const { addRoom, upsertRooms } = roomsSlice.actions;

export const selectAllRooms = roomsSelectors.selectAll;
export const selectRoom = (id: string) =>
  roomsSelectors.selectById(store.getState(), id);

export const roomsReducer = roomsSlice.reducer;
