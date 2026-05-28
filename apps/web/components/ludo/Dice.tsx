"use client";

import { motion } from "framer-motion";

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

type SingleDieProps = {
  value: number | null;
  rolling?: boolean;
  used?: boolean;
  selected?: boolean;
  onClick?: () => void;
  label?: string;
};

function SingleDie({ value, rolling, used, selected, onClick, label }: SingleDieProps) {
  const showPlaceholder = !rolling && value === null;
  const displayValue = rolling ? Math.ceil(Math.random() * 6) : (value ?? 1);
  const dots = DOT_POSITIONS[displayValue] ?? DOT_POSITIONS[1];

  const interactive = Boolean(onClick) && !used && !rolling;

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        onClick={interactive ? onClick : undefined}
        disabled={!interactive}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        animate={
          rolling
            ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={
          rolling ? { duration: 0.4, repeat: Infinity } : { type: "spring", stiffness: 300 }
        }
        className={`relative h-14 w-14 rounded-xl border-2 bg-white shadow-md transition-all ${
          used
            ? "opacity-30 border-border cursor-default"
            : selected
            ? "border-primary ring-2 ring-primary/40"
            : interactive
            ? "border-dice-border hover:ring-2 hover:ring-primary/30 cursor-pointer"
            : "border-dice-border cursor-default"
        }`}
      >
        {showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center text-xl text-text-muted">
            ?
          </div>
        ) : (
          <svg viewBox="0 0 100 100" className="h-full w-full p-2">
            {dots.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={8} fill="#1F1F1F" />
            ))}
          </svg>
        )}

        {rolling && (
          <div className="absolute inset-0 rounded-xl bg-dice-glow/30 animate-pulse" />
        )}

        {used && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-text-muted">✓</span>
          </div>
        )}
      </motion.button>
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
      )}
    </div>
  );
}

type DicePairProps = {
  /** Both rolled values. */
  values: [number, number] | null;
  /** Values still unspent (subset of values). */
  remaining?: number[];
  rolling?: boolean;
  /** Which die value is currently selected for the next move. */
  selectedDie?: number | null;
  /** Click handler for selecting a die. */
  onSelect?: (dieValue: number) => void;
};

/**
 * Two-dice display. Each die is interactive when its value is still in
 * `remaining` and an `onSelect` handler is provided.
 */
export function Dice({ values, remaining, rolling, selectedDie, onSelect }: DicePairProps) {
  const [d1, d2] = values ?? [null, null];

  function makeHandlers(value: number | null, dieIndex: 0 | 1) {
    if (value === null || !onSelect) return { used: false, click: undefined };

    // Calculate how many copies of this value remain. We need to track per-slot
    // when both dice are the same (doubles): the first instance is "used" if
    // remaining only has one copy left.
    const total = (values ?? []).filter((v) => v === value).length;
    const left = (remaining ?? []).filter((v) => v === value).length;
    // For doubles: index 0 is used first.
    const used = dieIndex < total - left;

    return {
      used,
      click: used ? undefined : () => onSelect(value),
    };
  }

  const h1 = makeHandlers(d1, 0);
  const h2 = makeHandlers(d2, 1);

  return (
    <div className="flex items-center justify-center gap-4">
      <SingleDie
        value={d1}
        rolling={rolling}
        used={h1.used}
        selected={!h1.used && selectedDie === d1}
        onClick={h1.click}
        label="Die 1"
      />
      <SingleDie
        value={d2}
        rolling={rolling}
        used={h2.used}
        selected={!h2.used && selectedDie === d2 && !h1.used /* avoid both highlighted on doubles */}
        onClick={h2.click}
        label="Die 2"
      />
    </div>
  );
}
