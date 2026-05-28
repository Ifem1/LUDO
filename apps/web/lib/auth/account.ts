"use client";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { PrivateKeyAccount } from "viem/accounts";
import { encryptWithPassword, decryptWithPassword } from "./crypto";
import {
  AccountRecord,
  getAccount,
  saveAccount,
  normaliseEmail,
  setLastEmail,
} from "./storage";

export type SignedInAccount = {
  email: string;
  address: `0x${string}`;
  account: PrivateKeyAccount; // viem signer — keep in memory only
};

/** Sign up a brand-new account: generates a private key and stores it encrypted. */
export async function createAccount(
  email: string,
  password: string
): Promise<SignedInAccount> {
  const cleanEmail = normaliseEmail(email);
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("invalid_email");
  }
  if (password.length < 8) {
    throw new Error("password_too_short");
  }
  if (getAccount(cleanEmail)) {
    throw new Error("account_already_exists");
  }

  const privateKey = generatePrivateKey();
  const viemAccount = privateKeyToAccount(privateKey);
  const encryptedKey = await encryptWithPassword(privateKey, password);

  const record: AccountRecord = {
    email: cleanEmail,
    address: viemAccount.address.toLowerCase(),
    encryptedKey,
    createdAt: Date.now(),
  };
  saveAccount(record);
  setLastEmail(cleanEmail);

  return {
    email: cleanEmail,
    address: viemAccount.address.toLowerCase() as `0x${string}`,
    account: viemAccount,
  };
}

/** Decrypt an existing account with its password. */
export async function signIn(
  email: string,
  password: string
): Promise<SignedInAccount> {
  const cleanEmail = normaliseEmail(email);
  const record = getAccount(cleanEmail);
  if (!record) {
    throw new Error("account_not_found");
  }

  let privateKey: string;
  try {
    privateKey = await decryptWithPassword(record.encryptedKey, password);
  } catch {
    throw new Error("invalid_password");
  }

  const viemAccount = privateKeyToAccount(privateKey as `0x${string}`);
  setLastEmail(cleanEmail);

  return {
    email: cleanEmail,
    address: record.address.toLowerCase() as `0x${string}`,
    account: viemAccount,
  };
}

/** Change password by re-encrypting the existing private key. */
export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const record = getAccount(email);
  if (!record) throw new Error("account_not_found");
  if (newPassword.length < 8) throw new Error("password_too_short");

  let privateKey: string;
  try {
    privateKey = await decryptWithPassword(record.encryptedKey, oldPassword);
  } catch {
    throw new Error("invalid_password");
  }

  const encryptedKey = await encryptWithPassword(privateKey, newPassword);
  saveAccount({ ...record, encryptedKey });
}
