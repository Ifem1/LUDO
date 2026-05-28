"use client";

import { useMemo } from "react";
import { getCellMap, tokenLocalToCell, BOARD_SIZE, PERIMETER_LENGTH } from "@/lib/ludo/path";
import { previewCaptures } from "@/lib/ludo/rules";
import { BoardCell } from "./BoardCell";
import { Token } from "./Token";
import type { GameState, PlayerColour } from "@ludoproof/shared";

type TokenEntry = {
  colour: PlayerColour;
  tokenIdx: number;
  playerIdx: number;
};

type Props = {
  game: GameState;
  /** Map of die value → array of legal token indexes (for the active player). */
  validMoves: Record<number, number[]>;
  /** Currently selected die value (controls which tokens light up). */
  selectedDie: number | null;
  /** Called when a player clicks a highlighted token. */
  onTokenClick: (tokenIndex: number, dieValue: number) => void;
  myColour: PlayerColour | null;
};

export function LudoBoard({
  game,
  validMoves,
  selectedDie,
  onTokenClick,
  myColour,
}: Props) {
  const cells = useMemo(() => Array.from(getCellMap().values()), []);

  /**
   * Place every token on its current cell. We use slot index inside the base
   * so the 4 tokens of a colour spread to the 4 spawn pads rather than piling
   * onto one pad.
   */
  const tokensByCell = useMemo(() => {
    const map = new Map<string, TokenEntry[]>();
    game.players.forEach((player, pIdx) => {
      // Count how many of this colour's tokens are already in base so each
      // gets its own pad (slot 0..3) deterministically.
      let baseSlot = 0;
      player.tokens.forEach((pos, tIdx) => {
        const slot = pos === -1 ? baseSlot++ : 0;
        const [c, r] = tokenLocalToCell(player.colour, pos, slot);
        const key = `${c},${r}`;
        const arr = map.get(key) ?? [];
        arr.push({ colour: player.colour, tokenIdx: tIdx, playerIdx: pIdx });
        map.set(key, arr);
      });
    });
    return map;
  }, [game.players]);

  const currentPlayer = game.players[game.currentTurnIndex];
  const isMyTurn = currentPlayer?.colour === myColour && game.status === "active";

  // Tokens that are legal for the currently selected die (mine, this turn only).
  const legalTokens = selectedDie !== null ? validMoves[selectedDie] ?? [] : [];

  // Pre-compute the destination cells of legal moves so we can glow them.
  const legalDestKeys = useMemo(() => {
    if (!isMyTurn || selectedDie === null || !myColour) return new Set<string>();
    const myPlayer = game.players.find((p) => p.colour === myColour);
    if (!myPlayer) return new Set<string>();
    const out = new Set<string>();
    for (const tIdx of legalTokens) {
      const current = myPlayer.tokens[tIdx];
      const next = current === -1 && selectedDie === 6 ? 0 : current + selectedDie;
      if (next < 0 || next > 58) continue;
      const [c, r] = tokenLocalToCell(myColour, next, 0);
      out.add(`${c},${r}`);
    }
    return out;
  }, [isMyTurn, selectedDie, myColour, game.players, legalTokens]);

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div
        className="board-grid rounded-2xl ring-1 ring-black/10 shadow-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(248,247,255,1) 0%, rgba(243,240,255,1) 100%)",
        }}
      >
        {cells.map((meta) => {
          const key = `${meta.col},${meta.row}`;
          const here = tokensByCell.get(key) ?? [];
          const highlighted = legalDestKeys.has(key);

          return (
            <BoardCell key={key} meta={meta} highlighted={highlighted}>
              {here.map((t, idx) => {
                const isMine =
                  t.playerIdx === game.currentTurnIndex && t.colour === myColour;
                const isValid =
                  isMine &&
                  isMyTurn &&
                  selectedDie !== null &&
                  legalTokens.includes(t.tokenIdx);

                return (
                  <Token
                    key={`${t.colour}-${t.tokenIdx}`}
                    colour={t.colour}
                    isValid={isValid}
                    isActive={isMine && isMyTurn}
                    onClick={
                      isValid && selectedDie !== null
                        ? () => onTokenClick(t.tokenIdx, selectedDie)
                        : undefined
                    }
                    stackSize={here.length}
                    stackIndex={idx}
                  />
                );
              })}
            </BoardCell>
          );
        })}
      </div>
    </div>
  );
}
