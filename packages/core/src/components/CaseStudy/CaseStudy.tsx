import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import { ScreenshotCarousel, type Screenshot } from '../ScreenshotCarousel/ScreenshotCarousel';
import { Tag } from '../Tag/Tag';
import styles from './CaseStudy.module.scss';

type Props = {
  /** The project's name (labels the carousel). */
  name: string;
  /** The one-line summary, shown first. */
  summary: string;
  role?: string | null;
  /** Who it was for (client work), shown at a glance, e.g. "Acme Corp" or "Confidential client". */
  client?: string | null;
  problem?: string | null;
  approach?: string | null;
  outcome?: string | null;
  /** The one-line result with a number ("Deploys in 90 s on every merge"), shown at a glance next to the role and stack. */
  keyResult?: string | null;
  /** Carousel order; the first is the cover. */
  screenshots?: Screenshot[] | null;
  /** The stack, shown at a glance. */
  tags?: string[] | null;
  /** The live site: adds "Visit site ↗" (new tab). */
  liveUrl?: string | null;
  /** More actions after "Visit site", e.g. "Run it here" or "all projects". */
  actions?: ReactNode;
  /** Extra sections for this one project (live data, diagrams, demos), between the facts and the actions. */
  children?: ReactNode;
  className?: string;
};

const FACTS = ['problem', 'approach', 'outcome'] as const;
const LABEL: Record<(typeof FACTS)[number], string> = { problem: 'Problem', approach: 'Approach', outcome: 'Outcome' };

/**
 * The body of a case file: the summary; "at a glance" (role, stack, key
 * result: what a skimmer needs in three lines); problem / approach / outcome
 * next to the screenshot carousel (stacked on small screens); any extra
 * sections a project brings (children); then actions.
 * Put it in a <Panel index="CASE FILE" title={name}>. Empty facts are left out.
 * Accent element: the mark on the key result (else the carousel's current dot, or the tags' bullets).
 */
export function CaseStudy({ name, summary, role, client, problem, approach, outcome, keyResult, screenshots, tags, liveUrl, actions, children, className }: Props) {
  const values = { problem, approach, outcome };
  const facts = FACTS.filter((k) => values[k]?.trim());
  const shots = screenshots ?? [];
  const stack = tags ?? [];
  const glance = Boolean(role?.trim() || client?.trim() || stack.length || keyResult?.trim());
  return (
    <div className={cx(styles.case, className)}>
      {summary && <p className={styles.summary}>{summary}</p>}
      {glance && (
        <dl className={styles.glance} aria-label="At a glance">
          {keyResult?.trim() && (
            <div className={cx(styles.glanceRow, styles.result)}>
              <dt>Result</dt>
              <dd>{keyResult}</dd>
            </div>
          )}
          {client?.trim() && (
            <div className={styles.glanceRow}>
              <dt>Client</dt>
              <dd>{client}</dd>
            </div>
          )}
          {role?.trim() && (
            <div className={styles.glanceRow}>
              <dt>Role</dt>
              <dd>{role}</dd>
            </div>
          )}
          {stack.length > 0 && (
            <div className={styles.glanceRow}>
              <dt>Stack</dt>
              <dd className={styles.tags}>
                {stack.map((t) => <Tag key={t}>{t}</Tag>)}
              </dd>
            </div>
          )}
        </dl>
      )}
      {(facts.length > 0 || shots.length > 0) && (
        <div className={cx(styles.grid, (!facts.length || !shots.length) && styles.single)}>
          {facts.length > 0 && (
            <dl className={styles.facts}>
              {facts.map((k) => (
                <div key={k} className={styles.fact}>
                  <dt>{LABEL[k]}</dt>
                  <dd>{values[k]}</dd>
                </div>
              ))}
            </dl>
          )}
          {shots.length > 0 && <ScreenshotCarousel shots={shots} label={`Screenshots of ${name}`} />}
        </div>
      )}
      {children}
      {(liveUrl || actions) && (
        <div className={styles.actions}>
          {liveUrl && <Button variant="outline" href={liveUrl} external>Visit site</Button>}
          {actions}
        </div>
      )}
    </div>
  );
}
