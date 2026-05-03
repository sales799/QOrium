/**
 * Opaque cursor encoding for stable list pagination.
 *
 * Cursor encodes the (released_at, id) tuple of the last row of the
 * previous page. Subsequent pages filter `WHERE (released_at, id) <
 * (cursor.released_at, cursor.id)` to walk the result set without
 * skipping or duplicating rows under concurrent writes.
 *
 * Wire format: base64url(JSON({ r: <released_at_iso>, i: <uuid> }))
 */

export interface QuestionCursor {
  released_at: string;
  id: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InvalidCursorError extends Error {
  constructor(message = 'Cursor is malformed') {
    super(message);
    this.name = 'InvalidCursorError';
  }
}

export function encodeCursor(c: QuestionCursor): string {
  const json = JSON.stringify({ r: c.released_at, i: c.id });
  return Buffer.from(json, 'utf8').toString('base64url');
}

export function decodeCursor(raw: string): QuestionCursor {
  let text: string;
  try {
    text = Buffer.from(raw, 'base64url').toString('utf8');
  } catch {
    throw new InvalidCursorError();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new InvalidCursorError();
  }
  if (typeof parsed !== 'object' || parsed === null) throw new InvalidCursorError();
  const obj = parsed as { r?: unknown; i?: unknown };
  if (typeof obj.r !== 'string' || typeof obj.i !== 'string') throw new InvalidCursorError();
  if (!UUID_PATTERN.test(obj.i)) throw new InvalidCursorError('Cursor id is not a UUID');
  if (Number.isNaN(Date.parse(obj.r))) throw new InvalidCursorError('Cursor timestamp is invalid');
  return { released_at: obj.r, id: obj.i };
}
