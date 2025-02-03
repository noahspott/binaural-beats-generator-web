import { createHash } from 'crypto';

interface RateLimitEntry {
  count: number;
  lastReset: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private readonly DAILY_LIMIT = 1;
  private readonly RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    this.store = new Map();
  }

  private hashIP(ip: string): string {
    return createHash('sha256').update(ip).digest('hex');
  }

  async isAllowed(ip: string): Promise<boolean> {
    const hashedIP = this.hashIP(ip);
    const now = Date.now();
    const entry = this.store.get(hashedIP);

    if (!entry) {
      // First request from this IP
      this.store.set(hashedIP, { count: 1, lastReset: now });
      return true;
    }

    // Check if we need to reset the counter
    if (now - entry.lastReset >= this.RESET_INTERVAL) {
      this.store.set(hashedIP, { count: 1, lastReset: now });
      return true;
    }

    // Check if limit is reached
    if (entry.count >= this.DAILY_LIMIT) {
      return false;
    }

    // Increment counter
    entry.count += 1;
    this.store.set(hashedIP, entry);
    return true;
  }

  async getRemainingTime(ip: string): Promise<number> {
    const hashedIP = this.hashIP(ip);
    const entry = this.store.get(hashedIP);
    if (!entry) return 0;

    const now = Date.now();
    const timeUntilReset = this.RESET_INTERVAL - (now - entry.lastReset);
    return Math.max(0, timeUntilReset);
  }

  // Helper to format remaining time for error messages
  formatRemainingTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

// Export a singleton instance
export const rateLimiter = new RateLimiter(); 