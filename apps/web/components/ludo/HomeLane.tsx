import type { PlayerColour } from "@ludoproof/shared";
import { COLOUR_HEX } from "@/lib/constants";

type Props = {
  colour: PlayerColour;
  tokensIn: number;
};

export function HomeLane({ colour, tokensIn }: Props) {
  return (
    <div
      className="flex items-center gap-1 rounded px-2 py-1"
      style={{ backgroundColor: COLOUR_HEX[colour] + "22" }}
    >
      <span className="text-xs capitalize text-text-muted">{colour} home:</span>
      <span className="text-xs font-bold" style={{ color: COLOUR_HEX[colour] }}>
        {tokensIn}/6
      </span>
    </div>
  );
}
