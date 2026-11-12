/** What useTextReveal returns: the current frame and a function that plays the reveal again. */
export type TextRevealControl = readonly [(string | null)[] | null, () => void];

/**
 * Drives a library's text reveal by hand. Returns the current frame (one
 * entry per character, null where the real character shows; null when the
 * text is at rest) and a function that plays it again. Plain has no reveal:
 * the frame is always null.
 */
export function useTextReveal(text: string, duration = 1000): TextRevealControl {
  void text;
  void duration;
  return REST;
}

const REST: TextRevealControl = [null, () => {}];
