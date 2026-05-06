/**
 * In-memory deploy history. Bounded ring buffer; the dashboard MCP
 * polls /v1/setu/deploys for the latest entries.
 */

import type { DeployOutcome } from './runner.js';

export interface DeployHistoryEntry extends DeployOutcome {
  id: string;
  trigger: 'webhook' | 'manual' | 'cron';
}

export class DeployHistory {
  private readonly capacity: number;
  private buffer: DeployHistoryEntry[] = [];
  constructor(capacity = 50) {
    this.capacity = capacity;
  }
  record(entry: DeployHistoryEntry): void {
    this.buffer.unshift(entry);
    if (this.buffer.length > this.capacity) {
      this.buffer = this.buffer.slice(0, this.capacity);
    }
  }
  list(): DeployHistoryEntry[] {
    return [...this.buffer];
  }
  latest(): DeployHistoryEntry | null {
    return this.buffer[0] ?? null;
  }
  clear(): void {
    this.buffer = [];
  }
}
