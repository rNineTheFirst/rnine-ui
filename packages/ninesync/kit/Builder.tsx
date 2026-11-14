import { useEffect, useId, useState } from 'react';
import { Alert, Button, Status, Tag, TextField, parseHex, type ClientColorCheck, type ClientColors } from '@rnine/ninesync';
import { ClientTheme, LiveDot, Tabs, clientThemeCss, syncColors } from '@rnine/ninesync';
import { TextReveal } from '@rnine/ninesync/motion';
import { CopyValue, MoodScope } from '../../core/site/shell';
import { SAMPLE_CLIENTS } from '../src/example/client';
import styles from './Builder.module.scss';

type Mood = 'light' | 'dark';
type Inputs = { brand: string; light: string; dark: string };

const MOODS: Record<Mood, string> = { light: 'Light', dark: 'Dark' };
const LEVEL: Record<ClientColorCheck['level'], { word: string; icon: string }> = {
  ok: { word: 'OK', icon: '✓' },
  warning: { word: 'Warning', icon: '!' },
  error: { word: 'Error', icon: '✕' },
};
/** The roles a client's colors set that are worth seeing, with what each is for. */
const ROLES: [string, string][] = [
  ['accent', 'Buttons, the selected state'],
  ['on-accent', 'Text on buttons'],
  ['accent-text', 'Links and text in the brand color'],
  ['mark', 'The pale mark (decoration, never text)'],
  ['accent-soft', 'Selected rows, soft fills'],
  ['bg', 'The page, tinted toward the hue'],
  ['surface', 'Cards'],
  ['line', 'Hairlines'],
];

/** The colors to check, from inputs: empty second colors are left out. */
const toColors = ({ brand, light, dark }: Inputs): ClientColors => ({
  brand: brand.trim(),
  ...(light.trim() ? { light: light.trim() } : {}),
  ...(dark.trim() ? { dark: dark.trim() } : {}),
});

/** The colors as code for an app: <ClientTheme colors={...} />. */
const toCode = (c: ClientColors) =>
  `<ClientTheme colors={{ ${Object.entries(c).map(([k, v]) => `${k}: '${parseHex(v) ?? v}'`).join(', ')} }} />`;

/** The colors in the address (?brand=F07F13&light=A3560D), so a check can be shared. */
function fromAddress(): Inputs | null {
  try {
    const q = new URLSearchParams(location.search);
    const get = (k: string) => (q.get(k) ? `#${q.get(k)!.replace(/^#/, '')}` : '');
    return q.get('brand') ? { brand: get('brand'), light: get('light'), dark: get('dark') } : null;
  } catch {
    return null;
  }
}

/** This page's address with the colors in it. */
function addressOf(c: ClientColors): string {
  const q = new URLSearchParams(location.search);
  for (const k of ['brand', 'light', 'dark'] as const) {
    const v = c[k] && parseHex(c[k]!);
    if (v) q.set(k, v.slice(1));
    else q.delete(k);
  }
  return `${location.pathname}?${q}${location.hash}`;
}

function toAddress(c: ClientColors) {
  try {
    history.replaceState(null, '', addressOf(c));
  } catch {
    // Some hosts (previews) don't allow it; the builder works without
  }
}

const preset = SAMPLE_CLIENTS[1];
const START: Inputs = { brand: preset.colors.brand, light: preset.colors.light ?? '', dark: preset.colors.dark ?? '' };

/** One color: a hex field and a color picker beside it. */
function ColorInput({ label, hint, value, onChange, optional }: { label: string; hint: string; value: string; onChange: (v: string) => void; optional?: boolean }) {
  const parsed = parseHex(value);
  const bad = value.trim() !== '' && !parsed;
  return (
    <div className={styles.color}>
      <TextField
        label={label}
        hint={hint}
        error={bad ? 'Use a hex code, such as #2B4D82.' : undefined}
        value={value}
        placeholder={optional ? 'None' : '#2B4D82'}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="color"
        className={styles.picker}
        aria-label={`${label}: pick a color`}
        value={(parsed ?? '#808080').toLowerCase()}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />
    </div>
  );
}

/** A small screen in the client's colors, in one mood. */
function Preview({ mood, scope }: { mood: Mood; scope: string }) {
  return (
    <MoodScope mood={mood} label={MOODS[mood]} className={`${styles.preview} ${scope}`}>
      <div className={styles.previewHead}>
        <TextReveal as="h3" className={styles.previewTitle} text="Purchase orders" trigger="hover" />
        <LiveDot>Synced</LiveDot>
      </div>
      <Tabs
        label={`Purchase orders (${MOODS[mood]} preview)`}
        defaultValue="open"
        items={[
          { id: 'open', label: 'Open', content: <p className={styles.previewText}>PO-1042 from <a href="#builder">Bayview Metals</a> is waiting for your approval.</p> },
          { id: 'received', label: 'Received', content: <p className={styles.previewText}>42 received this month.</p> },
        ]}
      />
      <div className={styles.previewRow}>
        <Button size="sm">Approve order</Button>
        <Button size="sm" variant="secondary">Save draft</Button>
      </div>
      <div className={styles.previewRow}>
        <Tag>Steel plate</Tag>
        <Status tone="warning">Awaiting approval</Status>
      </div>
    </MoodScope>
  );
}

/**
 * The client color builder: a brand color (and second colors) in, both
 * moods previewed, every check in plain words, and the code to take away.
 * Uses the same syncColors as ClientTheme, so what passes here passes in the app.
 */
export function Builder({ onColors }: { onColors?: (colors: ClientColors | null) => void }) {
  const [inputs, setInputs] = useState<Inputs>(() => fromAddress() ?? START);
  const scope = `builder-${useId().replace(/[^a-z0-9]/gi, '')}`;
  const colors = toColors(inputs);
  const valid = Boolean(parseHex(colors.brand)) && (!colors.light || parseHex(colors.light)) && (!colors.dark || parseHex(colors.dark));
  const result = syncColors(colors);
  const set = (key: keyof Inputs) => (value: string) => setInputs((old) => ({ ...old, [key]: value }));

  useEffect(() => {
    if (valid) toAddress(colors);
    onColors?.(valid ? colors : null);
    // colors is a new object each render; its values are the dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, colors.brand, colors.light, colors.dark, onColors]);

  const errors = (['light', 'dark'] as const).filter((m) => result[m].checks.some((c) => c.level === 'error'));
  const warnings = [...result.light.checks, ...result.dark.checks].filter((c) => c.level === 'warning').length;

  const download = () => {
    const blob = new Blob([`/* NineSync client colors: ${JSON.stringify(colors)} */\n${clientThemeCss(colors)}\n`], { type: 'text/css' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'client-colors.css';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className={styles.builder}>
      {valid && <ClientTheme colors={colors} scope={`.${scope}`} />}

      <div className={styles.inputs}>
        <ColorInput label="Brand color" hint="The client's color, as they gave it." value={inputs.brand} onChange={set('brand')} />
        <ColorInput label="Second color for Light" hint="Only if the brand color fails in Light: a darker one from the client." value={inputs.light} onChange={set('light')} optional />
        <ColorInput label="Second color for Dark" hint="Only if it fails in Dark: a lighter one from the client." value={inputs.dark} onChange={set('dark')} optional />
      </div>

      <div className={styles.presets}>
        <span className={styles.label}>Try</span>
        {SAMPLE_CLIENTS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.preset}
            onClick={() => setInputs({ brand: c.colors.brand, light: c.colors.light ?? '', dark: c.colors.dark ?? '' })}
          >
            <span className={styles.chip} style={{ background: c.colors.brand }} aria-hidden="true" />
            {c.name}
          </button>
        ))}
      </div>

      {!valid ? (
        <Alert tone="warning" title="Not a color yet">Give the brand color as a hex code, such as #2B4D82.</Alert>
      ) : errors.length ? (
        <Alert tone="danger" title={`Not ready: ${errors.map((m) => MOODS[m]).join(' and ')} ${errors.length > 1 ? 'need' : 'needs'} a second color`}>
          Ask the client for a {errors.map((m) => (m === 'light' ? 'darker color for Light' : 'lighter color for Dark')).join(' and a ')}. Until then the suggested color stands in, so the app stays readable.
        </Alert>
      ) : (
        <Alert tone="success" title="Ready to use">
          Every check passes in both moods{warnings ? ` (${warnings} ${warnings > 1 ? 'warnings' : 'warning'} to keep in mind)` : ''}. Copy the code below into the app.
        </Alert>
      )}

      <div className={styles.moods}>
        {(['light', 'dark'] as const).map((mood) => (
          <div key={mood} className={styles.mood}>
            <Preview mood={mood} scope={scope} />
            <ul className={styles.checks} aria-label={`Checks in ${MOODS[mood]}`}>
              {result[mood].checks.map((c) => (
                <li key={c.id} className={styles.check} data-level={c.level}>
                  <span className={styles.level}><span aria-hidden="true">{LEVEL[c.level].icon}</span> {LEVEL[c.level].word}</span>
                  <span>
                    {c.message}
                    {c.suggestion && c.id === 'text' && (
                      <>
                        {' '}
                        <button type="button" className={styles.try} onClick={() => set(mood)(c.suggestion!)}>
                          Preview with {c.suggestion}
                        </button>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.tableWrap}>
              <table className={styles.roles}>
                <caption className={styles.hidden}>The roles these colors give in {MOODS[mood]}</caption>
                <thead><tr><th scope="col">Role</th><th scope="col">{MOODS[mood]}</th><th scope="col">For</th></tr></thead>
                <tbody>
                  {ROLES.map(([role, use]) => (
                    <tr key={role}>
                      <th scope="row"><code>{role}</code></th>
                      <td>
                        <span className={styles.swatchCell}>
                          <span className={styles.swatch} style={{ background: result[mood].roles[role] }} aria-hidden="true" />
                          <CopyValue value={result[mood].roles[role]} />
                        </span>
                      </td>
                      <td className={styles.muted}>{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {valid && (
        <div className={styles.take}>
          <span className={styles.label}>In the app, inside ThemeProvider</span>
          <CopyValue value={toCode(colors)} className={styles.code} />
          <div className={styles.previewRow}>
            <Button size="sm" variant="secondary" onClick={download}>Download client-colors.css</Button>
            <CopyValue value={`${location.origin}${addressOf(colors).replace(/#.*$/, '')}#builder`} label="Copy a link to this check" />
          </div>
        </div>
      )}
    </div>
  );
}
