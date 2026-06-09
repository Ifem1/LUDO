"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "./useWallet";
import { useUiStore } from "@/store/ui-store";
import {
  glCreateGame,
  glJoinGame,
  glCommitSeed,
  glStartGame,
  glRollDice,
  glSubmitMove,
  glForfeitGame,
  glCancelGame,
  glAiTakeTurn,
  glSubmitDispute,
  glResolveDispute,
} from "@/lib/genlayer/calls";

function useContractWriter() {
  const { address } = useWallet();
  const { setTx, resetTx } = useUiStore();
  const qc = useQueryClient();

  return useCallback(
    async (
      action: string,
      gameId: string,
      fn: (account: `0x${string}`) => Promise<string>
    ) => {
      if (!address) throw new Error("wallet_not_connected");
      setTx("pending", `${action}…`);
      try {
        const hash = await fn(address);
        setTx("success", `${action} submitted`, hash);
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: ["game", gameId] });
          resetTx();
        }, 2000);
        return hash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setTx("error", msg);
        throw err;
      }
    },
    [address, setTx, resetTx, qc]
  );
}

export function useGenLayerContract(gameId: string) {
  const write = useContractWriter();

  const createGame = (maxPlayers: number, mode: "pvp" | "vs_ai" = "pvp") =>
    write("create_game", gameId, (acc) => glCreateGame(acc, gameId, maxPlayers, mode));

  const aiTakeTurn = () =>
    write("ai_take_turn", gameId, (acc) => glAiTakeTurn(acc, gameId));

  const submitDispute = (moveNumber: number, claim: string) =>
    write("submit_dispute", gameId, (acc) => glSubmitDispute(acc, gameId, moveNumber, claim));

  const resolveDispute = (disputeId: string) =>
    write("resolve_dispute", gameId, (acc) => glResolveDispute(acc, disputeId));

  const joinGame = (colour: string) =>
    write("join_game", gameId, (acc) => glJoinGame(acc, gameId, colour));

  const commitSeed = (seedHash: string) =>
    write("commit_seed", gameId, (acc) => glCommitSeed(acc, gameId, seedHash));

  const startGame = () =>
    write("start_game", gameId, (acc) => glStartGame(acc, gameId));

  const rollDice = (rawSeed: string) =>
    write("roll_dice", gameId, (acc) => glRollDice(acc, gameId, rawSeed));

  const submitMove = (tokenIndex: number, dieValue: number) =>
    write("submit_move", gameId, (acc) =>
      glSubmitMove(acc, gameId, tokenIndex, dieValue)
    );

  const forfeitGame = () =>
    write("forfeit_game", gameId, (acc) => glForfeitGame(acc, gameId));

  const cancelGame = () =>
    write("cancel_game", gameId, (acc) => glCancelGame(acc, gameId));

  return {
    createGame,
    joinGame,
    commitSeed,
    startGame,
    rollDice,
    submitMove,
    forfeitGame,
    cancelGame,
    aiTakeTurn,
    submitDispute,
    resolveDispute,
  };
}
