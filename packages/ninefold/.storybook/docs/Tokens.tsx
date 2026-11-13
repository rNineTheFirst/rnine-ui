// Docs-page helpers: swatches and type samples drawn from the built tokens,
// so the brand pages can't drift from the code.
import { tokens } from '../../dist/tokens.js';

type Role = { name: string; value: string; description?: string };

const moods = [
  { scheme: 'light', label: `${tokens.moods.light.label} (day)` },
  { scheme: 'dark', label: `${tokens.moods.dark.label} (night)` },
] as const;

const cell = { display: 'grid', gridTemplateColumns: '44px 1fr', gap: 12, alignItems: 'center' } as const;

/** Each role's color in both moods, side by side. */
export function Swatches({ roles }: { roles: string[] }) {
  const byScheme = Object.fromEntries(moods.map(({ scheme }) => [scheme, Object.fromEntries((tokens.schemes[scheme] as Role[]).map((r) => [r.name, r]))]));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, margin: '16px 0 32px' }}>
      {moods.map(({ scheme, label }) => (
        <div key={scheme} data-scheme={scheme} style={{ padding: 16, borderRadius: 12, background: byScheme[scheme].bg.value, color: byScheme[scheme].fg.value, display: 'grid', gap: 10 }}>
          <strong style={{ fontFamily: 'var(--r9-font-mono)', fontSize: 12, letterSpacing: '0.13em', textTransform: 'uppercase' }}>{label}</strong>
          {roles.map((name) => {
            const role = byScheme[scheme][name];
            if (!role) return null;
            return (
              <div key={name} style={cell}>
                <span style={{ width: 44, height: 44, borderRadius: 10, background: role.value, boxShadow: 'inset 0 0 0 1px rgb(127 127 127 / 0.35)' }} />
                <span style={{ fontSize: 13, lineHeight: 1.35 }}>
                  <code style={{ fontSize: 12 }}>{name}</code> <span style={{ opacity: 0.75 }}>{role.value}</span>
                  {role.description && <><br /><span style={{ opacity: 0.75 }}>{role.description}</span></>}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** A line set in each type role. */
export function TypeRoles() {
  return (
    <div style={{ display: 'grid', gap: 18, margin: '16px 0 32px' }}>
      {tokens.typeRoles.map((r) => (
        <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'baseline' }}>
          <code style={{ fontSize: 12 }}>{r.name}</code>
          <span style={{ fontFamily: r.fontFamily, fontWeight: r.fontWeight, fontSize: r.fontSize, lineHeight: r.lineHeight, letterSpacing: r.letterSpacing, textTransform: r.name === 'label' || r.name === 'wordmark' ? 'uppercase' : undefined }}>
            {r.name === 'code' ? 'statusPage({ title })' : 'The lantern walks to the stop you pick'}
          </span>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'baseline' }}>
        <code style={{ fontSize: 12 }}>script</code>
        <span style={{ fontFamily: 'var(--r9-font-script)', fontSize: 36 }}>Sealed by hand</span>
      </div>
    </div>
  );
}
