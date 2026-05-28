import { verifySeedCommitment, deriveDicePairLocally } from "@/lib/crypto/dice-proof";

export async function verifyRollLocally(params: {
  gameId: string;
  player: string;
  revealedSeed: string;
  commitment: string;
  rollNonce: number;
  moveCount: number;
}): Promise<{
  valid: boolean;
  localDice: [number, number];
  commitmentMatch: boolean;
}> {
  const commitmentMatch = await verifySeedCommitment(params.revealedSeed, params.commitment);
  const localDice = await deriveDicePairLocally(
    params.gameId,
    params.player,
    params.revealedSeed,
    params.rollNonce,
    params.moveCount
  );
  return { valid: commitmentMatch, localDice, commitmentMatch };
}
