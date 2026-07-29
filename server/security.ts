import crypto from "crypto";

/**
 * Hashes a plaintext password using PBKDF2 with a secure random salt.
 * Returns a string in the format "salt:hash" suitable for database storage.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored "salt:hash" password string.
 * Also supports graceful fallback to plain-text passwords for backward compatibility.
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    if (!stored) return false;

    // Backward compatibility fallback for plain-text password matching
    if (!stored.includes(":")) {
      const pBuf = Buffer.from(password, "utf-8");
      const sBuf = Buffer.from(stored, "utf-8");
      if (pBuf.length !== sBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(pBuf, sBuf);
    }

    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;

    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(verifyHash, "hex"),
    );
  } catch (err) {
    console.error("🔒 Error verifying password:", err);
    return false;
  }
}

/**
 * Generates a high-entropy, cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Bruteforce protection tracker
 */
interface LockoutInfo {
  attempts: number;
  lockoutUntil: number;
}
const loginAttempts = new Map<string, LockoutInfo>();

/**
 * Checks if an IP is currently locked out from logging in due to too many failed attempts.
 */
export function checkLoginLockout(ip: string): {
  locked: boolean;
  timeLeftMinutes: number;
} {
  const record = loginAttempts.get(ip);
  if (!record) return { locked: false, timeLeftMinutes: 0 };

  const now = Date.now();
  if (now < record.lockoutUntil) {
    const timeLeft = Math.ceil((record.lockoutUntil - now) / 60000);
    return { locked: true, timeLeftMinutes: timeLeft };
  }

  // Lockout expired, reset attempts
  if (now >= record.lockoutUntil && record.attempts >= 5) {
    loginAttempts.delete(ip);
  }
  return { locked: false, timeLeftMinutes: 0 };
}

/**
 * Registers a failed login attempt for an IP. Lock out for 15 minutes after 5 failures.
 */
export function registerFailedAttempt(ip: string): {
  attempts: number;
  locked: boolean;
} {
  const record = loginAttempts.get(ip) || { attempts: 0, lockoutUntil: 0 };
  const now = Date.now();

  record.attempts++;
  if (record.attempts >= 5) {
    // 15 minutes lockout
    record.lockoutUntil = now + 15 * 60 * 1000;
    loginAttempts.set(ip, record);
    return { attempts: record.attempts, locked: true };
  }

  loginAttempts.set(ip, record);
  return { attempts: record.attempts, locked: false };
}

/**
 * Resets failed login attempts for an IP upon successful login.
 */
export function resetFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
