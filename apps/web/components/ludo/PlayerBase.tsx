import type { PlayerColour } from "@ludoproof/shared";
import { COLOUR_HEX } from "@/lib/constants";

type Props = {
  colour: PlayerColour;
  tokenCount: number;
};

export function PlayerBase({ colour, tokenCount }: Props) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border-2 p-2"
      style={{ borderColor: COLOUR_HEX[colour] + "66", backgroundColor: COLOUR_HEX[colour] + "11" }}
    >
      <span className="text-xs font-semibold capitalize" style={{ color: COLOUR_HEX[colour] }}>
        {colour} base ({tokenCount} tokens)
      </span>
    </div>
  );
}
