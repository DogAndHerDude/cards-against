import { Route, Routes } from "@solidjs/router";
import { Login } from "./Login/Login";
import { Rooms } from "./Rooms/Rooms";
import { Game } from "./Game/Game";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" component={Login} />
      <Route path="/rooms" component={Rooms} />
      <Route path="/game/:id" component={Game} />
    </Routes>
  );
}
