import { sha256Hex } from "./sha256";

/**
 * Replicates the contract's per-die derivation formula for the two-dice variant:
 * sha256(gameId|player|revealedSeed|rollNonce|moveCount|d{dieIndex}) % 6 + 1
 */
export async function deriveSingleDieLocally(
  gameId: string,
  player: string,
  revealedSeed: string,
  rollNonce: number,
  moveCount: number,
  dieIndex: 0 | 1
): Promise<number> {
  const source = [
    gameId,
    player.toLowerCase(),
    revealedSeed,
    rollNonce,
    moveCount,
    `d${dieIndex}`,
  ].join("|");
  const hex = await sha256Hex(source);
  const bigVal = BigInt(`0x${hex}`);
  return Number(bigVal % 6n) + 1;
}

export async function deriveDicePairLocally(
  gameId: string,
  player: string,
  revealedSeed: string,
  rollNonce: number,
  moveCount: number
): Promise<[number, number]> {
  const [d1, d2] = await Promise.all([
    deriveSingleDieLocally(gameId, player, revealedSeed, rollNonce, moveCount, 0),
    deriveSingleDieLocally(gameId, player, revealedSeed, rollNonce, moveCount, 1),
  ]);
  return [d1, d2];
}

export async function verifySeedCommitment(
  revealedSeed: string,
  commitment: string
): Promise<boolean> {
  const hash = await sha256Hex(revealedSeed);
  const clean = commitment.startsWith("0x") ? commitment.slice(2).toLowerCase() : commitment.toLowerCase();
  return hash === clean;
}
