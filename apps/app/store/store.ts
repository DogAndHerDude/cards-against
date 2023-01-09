import { configureStore } from "@reduxjs/toolkit";
import { roomsReducer } from "./slices/rooms.slice";
import { userReduer } from "./slices/user.slice";

export const store = configureStore({
  reducer: {
    user: userReduer,
    rooms: roomsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
