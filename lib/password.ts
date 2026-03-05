import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * Also handles legacy plaintext passwords during migration:
 * if the stored value is not a bcrypt hash, falls back to exact comparison.
 */
export async function verifyPassword(
  plaintext: string,
  storedHash: string
): Promise<boolean> {
  // bcrypt hashes always start with $2a$ or $2b$
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return bcrypt.compare(plaintext, storedHash);
  }
  // Legacy plaintext comparison (migration path)
  return plaintext === storedHash;
}

/**
 * Check whether a stored password is already hashed (bcrypt).
 */
export function isHashed(password: string): boolean {
  return password.startsWith('$2a$') || password.startsWith('$2b$');
}
