import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "../store";

type UserSliceState = {
  id?: string;
  name?: string;
  token?: string;
};

const initialState: UserSliceState = {};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      _,
      action: PayloadAction<{ id: string; name: string; token: string }>
    ) => {
      return {
        ...action.payload,
      };
    },
  },
});

export const userReduer = userSlice.reducer;

export const { setUser } = userSlice.actions;
