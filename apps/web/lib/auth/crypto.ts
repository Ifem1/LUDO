"use client";

/**
 * Password-based encryption for embedded wallet private keys.
 * Uses the Web Crypto API (no external deps).
 *
 *   key  = PBKDF2(password, salt, iterations=200_000, hash=SHA-256) → 256-bit AES key
 *   blob = AES-GCM-encrypt(privateKey, key, iv)
 *
 * Everything is stored base64-encoded so it survives JSON round-trips in localStorage.
 *
 * Note: TypeScript 5.7's DOM lib types Web Crypto's `BufferSource` as
 * `Uint8Array<ArrayBuffer>` specifically, while plain `new Uint8Array(n)`
 * widens to `Uint8Array<ArrayBufferLike>` (which includes `SharedArrayBuffer`).
 * We pass everything through the small `asBufferSource` cast helper below.
 */

const PBKDF2_ITERATIONS = 200_000;
const KEY_LENGTH_BITS = 256;
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12;   // bytes — AES-GCM standard

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  crypto.getRandomValues(out);
  return out;
}

/** Cast a Uint8Array to the BufferSource shape Web Crypto expects. */
function asBufferSource(u: Uint8Array): ArrayBuffer {
  return u.buffer as ArrayBuffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    asBufferSource(enc.encode(password)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: asBufferSource(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: KEY_LENGTH_BITS },
    false,
    ["encrypt", "decrypt"]
  );
}

export type EncryptedBlob = {
  ciphertext: string; // base64
  salt: string;       // base64
  iv: string;         // base64
};

export async function encryptWithPassword(
  plaintext: string,
  password: string
): Promise<EncryptedBlob> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    asBufferSource(enc.encode(plaintext))
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuf)),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
  };
}

export async function decryptWithPassword(
  blob: EncryptedBlob,
  password: string
): Promise<string> {
  const salt = base64ToBytes(blob.salt);
  const iv = base64ToBytes(blob.iv);
  const ciphertext = base64ToBytes(blob.ciphertext);
  const key = await deriveKey(password, salt);

  // AES-GCM authenticates the tag; wrong password throws OperationError.
  const plaintextBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    asBufferSource(ciphertext)
  );

  return new TextDecoder().decode(plaintextBuf);
}
