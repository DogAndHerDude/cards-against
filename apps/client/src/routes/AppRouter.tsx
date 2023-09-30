import { Navigate, Route, Routes } from "@solidjs/router";
import { Login } from "./Login/Login";
import { Rooms } from "./Rooms/Rooms";
import { Game } from "./Game/Game";
import { authStore } from "../store/auth.store";
import { Show } from "solid-js";

export function AppRouter() {
  const { auth } = authStore;

  return (
    <Show
      when={!!auth.token}
      fallback={
        <Routes>
          <Route path="/" component={Login} />
          <Route path="*" component={() => <Navigate href="/" />} />
        </Routes>
      }
    >
      <Routes>
        <Route path="/rooms" component={Rooms} />
        <Route path="/game/:id" component={Game} />
      </Routes>
    </Show>
  );
}
