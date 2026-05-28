"use client";

type Props = {
  validMoves: number[];
  onSelect: (idx: number) => void;
};

export function ValidMovesPanel({ validMoves, onSelect }: Props) {
  if (!validMoves.length) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-move-valid/20 p-3">
      <p className="mb-2 text-xs font-semibold text-primary">Select a token to move:</p>
      <div className="flex gap-2">
        {validMoves.map((idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Token {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
