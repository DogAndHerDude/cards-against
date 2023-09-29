import { Router } from "@solidjs/router";
import { AppRouter } from "./routes/AppRouter";
import { SocketProvider } from "./utils/SocketProvider";

export function App() {
  return (
    <SocketProvider>
      <Router>
        <AppRouter />
      </Router>
    </SocketProvider>
  );
}
