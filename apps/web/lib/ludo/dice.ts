/**
 * Dice helpers. Server (contract) is authoritative; these are only used for
 * the proof panel ("verify your own roll") and for the cosmetic shake
 * animation while a roll transaction is pending.
 */

export {
  deriveSingleDieLocally,
  deriveDicePairLocally,
  verifySeedCommitment,
} from "@/lib/crypto/dice-proof";
