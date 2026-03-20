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
  // Only accept bcrypt hashes — reject unhashed / legacy plaintext passwords
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return bcrypt.compare(plaintext, storedHash);
  }
  // Legacy plaintext passwords are no longer accepted.
  // Users with unhashed passwords must reset via admin or OAuth.
  return false;
}

/**
 * Check whether a stored password is already hashed (bcrypt).
 */
export function isHashed(password: string): boolean {
  return password.startsWith('$2a$') || password.startsWith('$2b$');
}
