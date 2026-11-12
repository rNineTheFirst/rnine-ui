import { createContext, useContext, type ReactNode } from 'react';

/**
 * A mark's artwork, as SVG source (e.g. a `?raw` import): the paths' `d` and
 * the viewBox are used, every path is filled with the text color.
 */
export type MarkArtwork = {
  /** The whole mark. */
  full: string;
  /** Heavy strokes only, for 24px and below. Default: the full mark. */
  simplified?: string;
};

/** Shown until an app provides its own mark: a plain square frame. */
export const PLACEHOLDER_MARK: MarkArtwork = {
  full: '<svg viewBox="0 0 100 100"><path d="M0 0H100V100H0Z M14 14V86H86V14Z"/></svg>',
  simplified: '<svg viewBox="0 0 100 100"><path d="M0 0H100V100H0Z M22 22V78H78V22Z"/></svg>',
};

const MarkContext = createContext<MarkArtwork>(PLACEHOLDER_MARK);

/**
 * Gives every Mark inside it this artwork. ThemeProvider's mark prop does the
 * same; use this one where there is no ThemeProvider.
 */
export function MarkProvider({ mark, children }: { mark: MarkArtwork; children: ReactNode }) {
  return <MarkContext.Provider value={mark}>{children}</MarkContext.Provider>;
}

/** The artwork Mark draws: the nearest provider's, else the placeholder. */
export function useMark(): MarkArtwork {
  return useContext(MarkContext);
}

export type MarkVariant = 'full' | 'simplified';

/** Mark's props: the same in every library. */
export type MarkProps = {
  size?: number | string;
  /** full: the whole mark. simplified: heavy strokes only, for 24px and below. */
  variant?: MarkVariant;
  /** When the library's mark animation plays (NineOS: a slice glitch): on hover, on mount, or never. */
  animate?: 'hover' | 'mount' | 'none';
  label?: string;
  className?: string;
};

type Parsed = { viewBox: string; paths: string[] };
const parsed = new Map<string, Parsed>();

function parse(svg: string): Parsed {
  let mark = parsed.get(svg);
  if (!mark) {
    mark = {
      viewBox: svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 100 100',
      paths: [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
    };
    parsed.set(svg, mark);
  }
  return mark;
}

/** The artwork as an inline SVG filled with the text color (for libraries' Mark). */
export function MarkArt({ variant }: { variant: MarkVariant }) {
  const artwork = useMark();
  const { viewBox, paths } = parse(variant === 'simplified' ? (artwork.simplified ?? artwork.full) : artwork.full);
  return (
    <svg viewBox={viewBox} aria-hidden="true" focusable="false">
      {paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
