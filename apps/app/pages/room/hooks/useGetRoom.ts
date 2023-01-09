import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { SocketClient } from "../../../utils/sockets/socket.client";

export const useGetRoom = (roomId: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // TODO: On error it should redirect back to home
    const client = SocketClient.getClient();

    client.emit("GET_ROOM", { roomId }, (data: unknown) => {
      // TODO: dispatch room details to currentRoom.slice
    });
  }, []);
};
