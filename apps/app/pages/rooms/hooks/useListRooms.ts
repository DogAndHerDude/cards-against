import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  addRoom,
  RoomListEntity,
  upsertRooms,
} from "../../../store/slices/rooms.slice";
import { SocketClient } from "../../../utils/sockets/socket.client";

export const useListRooms = () => {
  const { token } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const client = SocketClient.getClient(token as string);

  useEffect(() => {
    client.emit("LIST_ROOMS", (data: RoomListEntity[]) => {
      console.log("ROOMS:", data);
      dispatch(upsertRooms(data));
    });
    client.on("ROOM_CREATED", (data: RoomListEntity) => {
      console.log("ROOM CREATED:", data);
      dispatch(addRoom(data));
    });
  }, []);
};
