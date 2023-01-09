import { useCallback } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { addRoom, RoomListEntity } from "../../../store/slices/rooms.slice";
import { SocketClient } from "../../../utils/sockets/socket.client";

export const useCreateRoom = () => {
  const dispatch = useAppDispatch();
  const createRoom = useCallback(() => {
    const client = SocketClient.getClient();

    client.emit("CREATE_ROOM", (data: RoomListEntity) => {
      dispatch(addRoom(data));
    });
  }, [dispatch]);

  return createRoom;
};
