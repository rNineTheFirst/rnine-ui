/** The text before its last word, and the last word (the one the mark goes under). */
export function splitMark(text: string): [string, string] {
  const trimmed = text.trimEnd();
  const at = trimmed.search(/\S+$/);
  return at <= 0 ? ['', trimmed] : [trimmed.slice(0, at), trimmed.slice(at)];
}
