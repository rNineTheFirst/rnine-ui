import type { CSSProperties } from 'react';
import { Mark, MarkProvider } from '@rnine/core';
import type { ThemeInfo } from '../types';
import styles from './shell.module.scss';

type Props = {
  themes: ThemeInfo[];
  /** Which site this is: the cards link to the theme's page on the same site (./<id>/). */
  site: 'docs' | 'kit';
  /** Where the other site is hosted, ending in "/": adds a second link per card. */
  otherUrl?: string | null;
  /** Inside Storybook's preview frame the links open in the whole window. */
  target?: '_top';
  /** Heading level of each card's name. */
  level?: 2 | 3;
};

const LABEL = { docs: 'Storybook', kit: 'Brand kit' } as const;

/** The theme's monogram, or until it has one, its initial in a ring. */
function Monogram({ theme, size }: { theme: ThemeInfo; size: number }) {
  if (theme.monogram) {
    return (
      <MarkProvider mark={{ full: theme.monogram }}>
        <Mark size={size} animate="none" label={`${theme.name} monogram`} />
      </MarkProvider>
    );
  }
  return (
    <span className={styles.initial} style={{ width: size, height: size }} aria-hidden="true">
      {theme.name.charAt(0)}
    </span>
  );
}

/**
 * One card per theme built on core: its monogram on its own two moods, its
 * name and what it's for, and links to its Storybook and brand kit. The
 * colors come from each theme's tokens, so every card shows that theme.
 */
export function ThemeCards({ themes, site, otherUrl, target, level = 2 }: Props) {
  const other = site === 'docs' ? 'kit' : 'docs';
  const Heading = `h${level}` as const;
  return (
    <ul className={styles.themes} aria-label="Themes">
      {themes.map((theme) => {
        const vars = Object.fromEntries(
          (['light', 'dark'] as const).flatMap((mood) =>
            Object.entries(theme.colors[mood]).map(([role, value]) => [`--theme-${mood}-${role}`, value]),
          ),
        ) as CSSProperties;
        return (
          <li key={theme.id} className={styles.theme} style={vars}>
            <a className={styles.moods} href={`./${theme.id}/`} target={target} aria-label={`${theme.name} ${LABEL[site]}`}>
              {(['light', 'dark'] as const).map((mood) => (
                <span key={mood} className={styles.mood} data-mood={mood}>
                  <Monogram theme={theme} size={56} />
                  <span className={styles.moodName}>{theme.moods[mood].label}</span>
                  <span className={styles.chips} aria-hidden="true">
                    <span style={{ background: `var(--theme-${mood}-accent)` }} />
                    <span style={{ background: `var(--theme-${mood}-signal)` }} />
                    <span style={{ background: `var(--theme-${mood}-surface)` }} />
                  </span>
                </span>
              ))}
            </a>
            <div className={styles.themeText}>
              <Heading className={styles.themeName}>{theme.name}</Heading>
              <code className={styles.themePackage}>{theme.package}@{theme.version}</code>
              {theme.tagline && <p className={styles.themeTagline}>{theme.tagline}</p>}
              <div className={styles.themeLinks}>
                <a href={`./${theme.id}/`} target={target}>{LABEL[site]}</a>
                {otherUrl && <a href={`${otherUrl}${theme.id}/`} target="_top">{LABEL[other]} <span aria-hidden="true">↗</span></a>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
