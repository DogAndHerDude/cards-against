import { Component, JSX } from "solid-js";
import { Button } from "../../components/Button/Button";

type RoomToolbarProps = {
  onCreateRoomClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};

export const RoomsToolbar: Component<RoomToolbarProps> = (props) => {
  return (
    <div class="w-full px-4 py-2 border-b border-zinc-600 flex items-center justify-between">
      <h1 class="font-extrabold text-2xl uppercase tracking-tight">
        Cards against
      </h1>

      <Button onClick={props.onCreateRoomClick}>Create room</Button>
    </div>
  );
};
