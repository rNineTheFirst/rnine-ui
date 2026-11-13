// Where writing may start: on the page's paper, not on what's printed on it.

/** Things you use, not paper: writing never starts on them, so links, buttons, fields and cards work as always. */
export const NOT_PAPER = 'a, button, input, textarea, select, label, summary, option, video, audio, iframe, [role="button"], [role="tab"], [role="link"], [role="slider"], [role="textbox"], [contenteditable]:not([contenteditable="false"]), [data-r9-card], [data-ink-off]';

type CaretDocument = Document & {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

/**
 * True when the point (viewport coordinates) is over a glyph of text, so a
 * drag there should select the text as usual. The box around a paragraph,
 * the gaps between lines and the margins are paper.
 */
export function overGlyph(x: number, y: number, doc: Document = document): boolean {
  const d = doc as CaretDocument;
  let node: Node | null = null;
  let offset = 0;
  if (typeof d.caretPositionFromPoint === 'function') {
    const pos = d.caretPositionFromPoint(x, y);
    node = pos?.offsetNode ?? null;
    offset = pos?.offset ?? 0;
  } else if (typeof d.caretRangeFromPoint === 'function') {
    const range = d.caretRangeFromPoint(x, y);
    node = range?.startContainer ?? null;
    offset = range?.startOffset ?? 0;
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const length = node.textContent?.length ?? 0;
  if (!length) return false;
  // The characters on either side of the caret: is the point inside one of their boxes?
  const range = doc.createRange();
  range.setStart(node, Math.max(0, offset - 1));
  range.setEnd(node, Math.min(length, offset + 1));
  if (typeof range.getClientRects !== 'function') return false;
  for (const r of Array.from(range.getClientRects())) {
    if (x >= r.left - 2 && x <= r.right + 2 && y >= r.top && y <= r.bottom) return true;
  }
  return false;
}

/** True when writing may start at this point on this target. */
export function isPaper(target: EventTarget | null, x: number, y: number): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest(NOT_PAPER)) return false;
  return !overGlyph(x, y, target.ownerDocument);
}
