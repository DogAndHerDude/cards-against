import { Component, JSX } from "solid-js";

type RoomToolbarProps = {
  onCreateRoomClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};

export const RoomsToolbar: Component<RoomToolbarProps> = (props) => {
  return (
    <div class="w-full border-b border-zinc-600 flex justify-end">
      <button
        class="px-3 py-1.5 rounded bg-zinc-50 text-zinc-900"
        onClick={props.onCreateRoomClick}
      >
        Create room
      </button>
    </div>
  );
};
