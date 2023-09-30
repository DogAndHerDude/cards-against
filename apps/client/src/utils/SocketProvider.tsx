import { Socket, connect as ioConnect } from "socket.io-client";
import { ParentComponent, createContext, useContext } from "solid-js";

function createSocketContext() {
  let socket: Socket;

  const connect = async (token: string) => {
    socket = ioConnect(import.meta.env.VITE_API_URL, {
      closeOnBeforeunload: true,
      auth: {
        token,
      },
    });

    return new Promise<void>((resolve, reject) => {
      socket.on("connect_error", (error: Error) => {
        reject(error);
      });
      socket.on("connect", () => {
        resolve();
      });
    });
  };
  const on = <T = unknown,>(event: string, callback: (payload: T) => void) => {
    socket.on(event, callback);
  };
  const emit = <T = unknown, D = unknown>(
    event: string,
    data?: D,
    callback?: (payload: T) => void,
  ): Promise<T> => {
    return new Promise((resolve) => {
      socket.emit(event, data, (payload: T) => {
        console.log(event, data, "lel");
        callback?.(payload);
        resolve(payload);
      });
    });
  };

  return {
    on,
    emit,
    connect,
  };
}

const SocketContext = createContext<ReturnType<typeof createSocketContext>>(
  createSocketContext(),
);

export const SocketProvider: ParentComponent = ({ children }) => {
  return (
    <SocketContext.Provider value={SocketContext.defaultValue}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSockets() {
  return useContext(SocketContext);
}
