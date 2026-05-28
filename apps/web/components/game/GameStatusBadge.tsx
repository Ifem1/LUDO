import type { GameStatus } from "@ludoproof/shared";
import { STATUS_LABELS } from "@/lib/constants";

const STATUS_COLOURS: Record<GameStatus, string> = {
  waiting: "bg-blue-100 text-blue-700",
  seed_commit: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-gray-100 text-gray-500",
  forfeited: "bg-red-100 text-red-600",
};

export function GameStatusBadge({ status }: { status: GameStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOURS[status]}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
