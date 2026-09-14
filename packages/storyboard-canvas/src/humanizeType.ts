/** Coerce a frame type for display; never throws on non-string input. */
export function humanizeType(type: unknown): string {
  return typeof type === 'string' ? type.replace(/[_-]+/g, ' ').trim() : '';
}
