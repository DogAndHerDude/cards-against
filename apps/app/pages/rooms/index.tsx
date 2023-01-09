import { useCallback } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/Button/Button";
import { TopBar } from "../../components/TopBar/TopBar";
import { useAppSelector } from "../../store/hooks";
import { selectAllRooms } from "../../store/slices/rooms.slice";
import { RoomCard } from "./components/RoomCard";
import { useCreateRoom } from "./hooks/useCreateRoom";
import { useListRooms } from "./hooks/useListRooms";

export default function Rooms() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const rooms = useAppSelector(selectAllRooms);
  const createRoom = useCreateRoom();
  const onCreateRoomClick = useCallback(() => createRoom(), [createRoom]);
  const onSelectRoomClick = useCallback((id: string) => {
    router.push(`/room/${id}`);
  }, []);

  useListRooms();

  return (
    <main className="w-screen h-screen">
      <TopBar>
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold">Rooms</h2>
          <Button onClick={onCreateRoomClick}>Create room</Button>
        </div>
      </TopBar>

      <section className="container mx-auto md:px-0 lg:px-32 py-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((room, idx) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={`Game ${idx + 1}`}
            players={room.players}
            inProgress={room.inProgress}
            onClick={onSelectRoomClick}
          />
        ))}
      </section>
    </main>
  );
}
