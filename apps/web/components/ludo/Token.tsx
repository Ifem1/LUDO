"use client";

import { motion } from "framer-motion";
import type { PlayerColour } from "@ludoproof/shared";
import { COLOUR_RAMPS } from "@/lib/ludo/board";

type Props = {
  colour: PlayerColour;
  isValid?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  size?: "xs" | "sm" | "md";
  /** Total number of tokens on the same cell (drives shrinkage). */
  stackSize?: number;
  /** Index within the stack (drives tiny offset). */
  stackIndex?: number;
};

export function Token({
  colour,
  isValid,
  isActive,
  onClick,
  size = "md",
  stackSize = 1,
  stackIndex = 0,
}: Props) {
  const ramp = COLOUR_RAMPS[colour];

  // Auto-shrink when stacked so multiple tokens still fit in one cell.
  const effectiveSize: "xs" | "sm" | "md" =
    stackSize >= 4 ? "xs" : stackSize >= 2 ? "sm" : size;

  const dim =
    effectiveSize === "xs"
      ? "h-2.5 w-2.5 border"
      : effectiveSize === "sm"
        ? "h-3.5 w-3.5 border-2"
        : "h-5 w-5 border-2";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!isValid}
      layout
      layoutId={undefined}
      whileHover={isValid ? { scale: 1.25 } : {}}
      whileTap={isValid ? { scale: 0.9 } : {}}
      animate={
        isActive
          ? { scale: [1, 1.15, 1] }
          : { scale: 1 }
      }
      transition={
        isActive
          ? { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
          : { type: "spring", stiffness: 380, damping: 22 }
      }
      className={`${dim} rounded-full shadow-md transition-shadow ${
        isValid
          ? "cursor-pointer ring-2 ring-primary ring-offset-1"
          : "cursor-default"
      }`}
      style={{
        backgroundColor: ramp.fill,
        borderColor: "white",
        boxShadow: isActive
          ? `0 0 8px ${ramp.fill}, 0 2px 4px rgba(0,0,0,0.2)`
          : "0 1px 2px rgba(0,0,0,0.25)",
      }}
      title={
        isValid
          ? `Move ${colour} token`
          : `${colour}${stackSize > 1 ? ` (stack of ${stackSize})` : ""}`
      }
    >
      {/* Centre highlight to give the token a 3D feel */}
      <span
        className="block h-full w-full rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 55%)`,
        }}
      />
    </motion.button>
  );
}
