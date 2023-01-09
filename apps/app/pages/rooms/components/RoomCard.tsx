import { useCallback } from "react";

type RoomCardProps = {
  id: string;
  name: string;
  players: number;
  inProgress: boolean;
  onClick?: (id: string) => void;
};

export const RoomCard = ({
  id,
  name,
  players,
  inProgress,
  onClick,
}: RoomCardProps) => {
  const onClickCardClick = useCallback(() => {
    onClick && onClick(id);
  }, [id]);

  return (
    <div
      className="border border-zinc-300 rounded-xl cursor-pointer transition-shadow eas-in-out hover:shadow-lg"
      onClick={onClickCardClick}
    >
      <div className="flex justify-between items-center border-b border-zinc-300 p-4">
        <h3 className="text-sm font-semibold">{name}</h3>
        <p className="text-xs text-zinc-400">
          {inProgress ? "In progress" : "Lobby"}
        </p>
      </div>

      <div className="p-4">
        <div className="flex">
          <p className="text-xs font-medium">Players:</p>{" "}
          <p className="text-xs ml-1 text-zinc-500">{players}</p>
        </div>
      </div>
    </div>
  );
};
