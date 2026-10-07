import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

/**
 * scrypt from node:crypto rather than a native bcrypt binding — no build step,
 * no platform-specific binary, and the parameters are recorded inside the hash
 * so they can be raised later without invalidating existing credentials.
 */
const PARAMS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, PARAMS);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored) return false;

  const [scheme, n, r, p, salt, digest] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !digest) return false;

  try {
    const expected = Buffer.from(digest, "base64url");
    const derived = await scryptAsync(
      password,
      Buffer.from(salt, "base64url"),
      expected.length,
      {
        N: Number(n) || PARAMS.N,
        r: Number(r) || PARAMS.r,
        p: Number(p) || PARAMS.p,
        maxmem: PARAMS.maxmem,
      },
    );
    return (
      derived.length === expected.length && timingSafeEqual(derived, expected)
    );
  } catch {
    return false;
  }
}
