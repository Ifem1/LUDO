"use client";

import { use, useEffect, useMemo, useState } from "react";
import { WalletGuard } from "@/components/wallet/WalletGuard";
import { LudoBoard } from "@/components/ludo/LudoBoard";
import { TurnPanel } from "@/components/ludo/TurnPanel";
import { GameControls } from "@/components/ludo/GameControls";
import { PlayerCard } from "@/components/ludo/PlayerCard";
import { MoveHistory } from "@/components/ludo/MoveHistory";
import { DiceProofPanel } from "@/components/ludo/DiceProofPanel";
import { WinnerModal } from "@/components/ludo/WinnerModal";
import { ForfeitModal } from "@/components/ludo/ForfeitModal";
import { MatchSummary } from "@/components/ludo/MatchSummary";
import { GameStatusBadge } from "@/components/game/GameStatusBadge";
import { GenLayerTxStatus } from "@/components/game/GenLayerTxStatus";
import { GameInviteCard } from "@/components/game/GameInviteCard";
import { useGamePolling } from "@/hooks/useGamePolling";
import { useValidMoves } from "@/hooks/useValidMoves";
import { useWallet } from "@/hooks/useWallet";
import { useUiStore } from "@/store/ui-store";
import { useGenLayerContract } from "@/hooks/useGenLayerContract";
import type { PlayerColour } from "@ludoproof/shared";
import { isContractConfigured } from "@/lib/genlayer/contract";

export default function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const { address } = useWallet();
  const { data: game, isLoading } = useGamePolling(gameId);
  const validMoves = useValidMoves();
  const { showForfeitModal, showWinnerModal, setWinnerModal } = useUiStore();
  const { submitMove } = useGenLayerContract(gameId);

  const [selectedDie, setSelectedDie] = useState<number | null>(null);

  const myColour = useMemo<PlayerColour | null>(() => {
    if (!address || !game) return null;
    const p = game.players.find((p) => p.address.toLowerCase() === address);
    return (p?.colour as PlayerColour) ?? null;
  }, [address, game]);

  useEffect(() => {
    if (game?.status === "completed" || game?.status === "forfeited") {
      setWinnerModal(true);
    }
  }, [game?.status, setWinnerModal]);

  // Clear selected die whenever a new turn starts or remaining dice change shape.
  useEffect(() => {
    if (!game?.diceRemaining.length) {
      setSelectedDie(null);
    }
  }, [game?.diceRemaining.length, game?.currentTurnIndex]);

  if (!isContractConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="rounded-xl bg-danger/10 p-8">
          <h2 className="mb-2 text-lg font-bold text-danger">Contract Not Configured</h2>
          <p className="text-sm text-text-muted">
            Add <code>NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS</code> to your <code>.env.local</code> file.
          </p>
        </div>
      </div>
    );
  }

  async function handleTokenClick(tokenIndex: number, dieValue: number) {
    try {
      await submitMove(tokenIndex, dieValue);
      // Selection cleared automatically when diceRemaining updates after refetch.
    } catch {
      // toast already shown by useGenLayerContract
    }
  }

  return (
    <WalletGuard>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <GenLayerTxStatus />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-black text-text-dark">Game: {gameId}</h1>
          {game && <GameStatusBadge status={game.status} />}
        </div>

        {isLoading && !game && (
          <div className="py-20 text-center text-text-muted">Loading game from GenLayer…</div>
        )}

        {!isLoading && !game && (
          <div className="py-20 text-center text-danger">Game not found. Check the game ID.</div>
        )}

        {game && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div>
              <LudoBoard
                game={game}
                validMoves={validMoves}
                selectedDie={selectedDie}
                onTokenClick={handleTokenClick}
                myColour={myColour}
              />
            </div>

            <div className="flex flex-col gap-4">
              <TurnPanel game={game} myColour={myColour} />

              <GameControls
                game={game}
                myColour={myColour}
                validMoves={validMoves}
                selectedDie={selectedDie}
                setSelectedDie={setSelectedDie}
              />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Players
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {game.players.map((p, i) => (
                    <PlayerCard
                      key={p.address}
                      player={p}
                      isCurrentTurn={i === game.currentTurnIndex && game.status === "active"}
                      isMe={p.address.toLowerCase() === address}
                    />
                  ))}
                </div>
              </div>

              {(game.status === "waiting" || game.status === "seed_commit") && (
                <GameInviteCard gameId={gameId} />
              )}

              <DiceProofPanel game={game} myColour={myColour} />

              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Move History
                </p>
                <MoveHistory moves={game.moveHistory} />
              </div>

              {(game.status === "completed" || game.status === "forfeited" || game.status === "cancelled") && (
                <MatchSummary game={game} />
              )}
            </div>
          </div>
        )}

        {showForfeitModal && game && <ForfeitModal game={game} />}
        {showWinnerModal && game && (
          <WinnerModal
            game={game}
            myColour={myColour}
            onClose={() => setWinnerModal(false)}
          />
        )}
      </div>
    </WalletGuard>
  );
}
