import { configureStore } from "@reduxjs/toolkit";
import { userReduer } from "./slices/user.slice";

export const store = configureStore({
  reducer: {
    user: userReduer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
