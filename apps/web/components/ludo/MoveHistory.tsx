"use client";

import type { MoveRecord } from "@ludoproof/shared";
import { COLOUR_HEX } from "@/lib/constants";

type Props = {
  moves: MoveRecord[];
};

const MOVE_ICONS: Record<string, string> = {
  roll: "🎲",
  move: "→",
  capture: "💥",
  forfeit: "🏳",
  win: "🏆",
  cancel: "✗",
  no_move: "—",
  three_sixes: "🚫×6",
};

export function MoveHistory({ moves }: Props) {
  const recent = [...moves].reverse().slice(0, 20);

  if (!recent.length) {
    return <p className="text-sm text-text-muted">No moves yet.</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1">
      {recent.map((m) => (
        <div
          key={m.moveNumber}
          className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-soft"
        >
          <span className="w-5 shrink-0 text-center">{MOVE_ICONS[m.moveType] ?? "•"}</span>
          <div
            className="h-2 w-2 mt-0.5 shrink-0 rounded-full"
            style={{ backgroundColor: m.colour ? COLOUR_HEX[m.colour] : "#6B7280" }}
          />
          <div className="flex-1">
            <span className="capitalize font-medium text-text-dark">{m.moveType.replace("_", " ")}</span>
            {m.dice !== undefined && (
              <span className="ml-1 text-text-muted">
                ({Array.isArray(m.dice) ? m.dice.join(", ") : m.dice})
              </span>
            )}
            {m.from !== undefined && m.to !== undefined && (
              <span className="ml-1 text-text-muted">
                {m.from} → {m.to}
              </span>
            )}
            {m.reason && <span className="block text-[10px] text-text-muted">{m.reason}</span>}
          </div>
          <span className="shrink-0 text-[10px] text-text-muted">#{m.moveNumber}</span>
        </div>
      ))}
    </div>
  );
}
