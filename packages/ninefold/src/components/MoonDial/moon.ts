/** The moon on a date: how far through its cycle (0 new, 0.5 full), how much of it is lit, and the phase's name. */
export type MoonPhase = { phase: number; lit: number; name: string };

const SYNODIC_DAYS = 29.530588853;
// A known new moon: 6 January 2000, 18:14 UTC
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

/** The moon's phase on `date` (to within a few hours: good for a dial, not for an almanac). */
export function moonPhase(date: Date = new Date()): MoonPhase {
  const age = ((((date.getTime() - NEW_MOON) / 86400000) % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
  const phase = age / SYNODIC_DAYS;
  const lit = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const name =
    phase < 0.0339 || phase > 0.9661 ? 'New moon'
      : phase < 0.216 ? 'Waxing crescent'
        : phase < 0.284 ? 'First quarter'
          : phase < 0.466 ? 'Waxing gibbous'
            : phase < 0.534 ? 'Full moon'
              : phase < 0.716 ? 'Waning gibbous'
                : phase < 0.784 ? 'Last quarter'
                  : 'Waning crescent';
  return { phase, lit, name };
}

/** SVG path data for the lit part of a moon of radius r at cx, cy. */
export function moonPath(cx: number, cy: number, r: number, phase: number): string {
  const k = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(k) * r;
  const waxing = phase < 0.5;
  const outer = `M${cx} ${cy - r}A${r} ${r} 0 0 ${waxing ? 1 : 0} ${cx} ${cy + r}`;
  const inner = `A${rx.toFixed(2)} ${r} 0 0 ${waxing ? (k > 0 ? 0 : 1) : k > 0 ? 1 : 0} ${cx} ${cy - r}`;
  return `${outer}${inner}Z`;
}
