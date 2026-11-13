import { contrast, grade, textPairs } from './contrast';
import { CopyValue } from './CopyValue';
import styles from './shell.module.scss';

export type Role = { name: string; cssVar: string; value: unknown; description?: string };

type Props = {
  /** The library's mood roles (tokens.schemes). */
  schemes: Record<'light' | 'dark', readonly Role[]>;
  /** The mood names to show (tokens.moods). */
  moods: Record<'light' | 'dark', { label: string }>;
};

const hex = (value: unknown) => String(value).slice(0, 7);

/** Every color role in both moods: swatch, values to copy, and what it's for. */
export function ColorRoles({ schemes, moods }: Props) {
  const dark = new Map(schemes.dark.map((r) => [r.name, r]));
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.hidden}>Color roles in both moods</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">{moods.light.label}</th>
            <th scope="col">{moods.dark.label}</th>
            <th scope="col">For</th>
          </tr>
        </thead>
        <tbody>
          {schemes.light.filter((r) => /^#[0-9a-f]{6}/i.test(String(r.value))).map((role) => {
            const night = dark.get(role.name);
            return (
              <tr key={role.name}>
                <th scope="row"><CopyValue value={`var(${role.cssVar})`} label={role.name} /></th>
                <td>
                  <span className={styles.swatchCell}>
                    <span className={styles.swatch} style={{ background: String(role.value) }} aria-hidden="true" />
                    <CopyValue value={String(role.value)} />
                  </span>
                </td>
                <td>
                  {night && (
                    <span className={styles.swatchCell}>
                      <span className={styles.swatch} style={{ background: String(night.value) }} aria-hidden="true" />
                      <CopyValue value={String(night.value)} />
                    </span>
                  )}
                </td>
                <td className={styles.muted}>{role.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The contrast of every text role on what it sits on, in both moods. */
export function ContrastTable({ schemes, moods }: Props) {
  const rows = (['light', 'dark'] as const).flatMap((mood) => {
    const roles = Object.fromEntries(
      schemes[mood].filter((r) => /^#[0-9a-f]{6}/i.test(String(r.value))).map((r) => [r.name, hex(r.value)]),
    );
    return textPairs(roles).map((pair) => {
      const ratio = contrast(roles[pair.text], roles[pair.on]);
      const result = grade(ratio);
      const passes = pair.large ? ratio >= 3 : ratio >= 4.5;
      return { mood, ...pair, ratio, result, passes };
    });
  });
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.hidden}>Contrast of each text role on its surfaces</caption>
        <thead>
          <tr>
            <th scope="col">Mood</th>
            <th scope="col">Text</th>
            <th scope="col">On</th>
            <th scope="col">Ratio</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.mood}-${row.text}-${row.on}`}>
              <td>{moods[row.mood].label}</td>
              <td><code>{row.text}</code>{row.large && <span className={styles.muted}> (large text)</span>}</td>
              <td><code>{row.on}</code></td>
              <td className={styles.num}>{row.ratio.toFixed(2)}</td>
              <td><span className={styles.grade} data-pass={row.passes || undefined}>{row.result}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
