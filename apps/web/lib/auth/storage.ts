"use client";

import type { EncryptedBlob } from "./crypto";

const STORAGE_KEY = "ludoproof_accounts_v1";

export type AccountRecord = {
  email: string;          // lowercased
  address: string;        // 0x… derived from the private key
  encryptedKey: EncryptedBlob;
  createdAt: number;
};

type AccountsFile = {
  accounts: Record<string, AccountRecord>;  // keyed by email
  lastEmail: string | null;
};

function readFile(): AccountsFile {
  if (typeof window === "undefined") return { accounts: {}, lastEmail: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accounts: {}, lastEmail: null };
    const parsed = JSON.parse(raw) as AccountsFile;
    return {
      accounts: parsed.accounts ?? {},
      lastEmail: parsed.lastEmail ?? null,
    };
  } catch {
    return { accounts: {}, lastEmail: null };
  }
}

function writeFile(file: AccountsFile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(file));
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function listAccountEmails(): string[] {
  return Object.keys(readFile().accounts);
}

export function getAccount(email: string): AccountRecord | null {
  return readFile().accounts[normaliseEmail(email)] ?? null;
}

export function saveAccount(record: AccountRecord): void {
  const file = readFile();
  const email = normaliseEmail(record.email);
  file.accounts[email] = { ...record, email };
  file.lastEmail = email;
  writeFile(file);
}

export function deleteAccount(email: string): void {
  const file = readFile();
  delete file.accounts[normaliseEmail(email)];
  if (file.lastEmail === normaliseEmail(email)) file.lastEmail = null;
  writeFile(file);
}

export function getLastEmail(): string | null {
  return readFile().lastEmail;
}

export function setLastEmail(email: string | null): void {
  const file = readFile();
  file.lastEmail = email ? normaliseEmail(email) : null;
  writeFile(file);
}
