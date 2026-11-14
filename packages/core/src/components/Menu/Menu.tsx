import {
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { popoverHost, useAnchoredPosition } from '../../hooks/anchoredPosition';
import { cx } from '../../utils/cx';
import type { RenderLink } from '../../utils/link';
import styles from './Menu.module.scss';

export type MenuItem = {
  kind?: 'item';
  key: string;
  label: ReactNode;
  /** An icon before the label, e.g. a lucide-react icon. */
  icon?: ReactNode;
  /** Runs when the item is picked; the menu then closes. */
  onSelect?: () => void;
  /** Makes the item a link. */
  href?: string;
  disabled?: boolean;
  /** danger: a destructive action ("Cancel order"). */
  tone?: 'danger';
  /**
   * Makes the item one choice of several (menuitemradio) with a check when
   * true, e.g. a role switcher in a group. Leave undefined for actions.
   */
  selected?: boolean;
};

export type MenuSeparator = { kind: 'separator'; key: string };
export type MenuGroup = { kind: 'group'; key: string; label: string; items: MenuItem[] };
export type MenuEntry = MenuItem | MenuSeparator | MenuGroup;

type TriggerProps = {
  id?: string;
  'aria-haspopup'?: 'menu';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
};

type Props = {
  /**
   * One button that opens the menu: a Button, or an icon-only Button with an
   * aria-label for row actions. It gets aria-haspopup, aria-expanded and the
   * handlers; its own onClick still runs.
   */
  trigger: ReactElement<TriggerProps>;
  items: MenuEntry[];
  /** Content above the items that can't be picked: the signed-in user's name and role. */
  header?: ReactNode;
  /** Which edge of the trigger the menu lines up with. Default start. */
  align?: 'start' | 'end';
  /** Where the menu opens; it flips when there's no room. Default bottom. */
  placement?: 'bottom' | 'top';
  /** Accessible name of the menu. Default: the trigger's name. */
  label?: string;
  /** Draws link items with your router instead of plain <a>. */
  renderLink?: RenderLink;
  /** On the wrapper around the trigger. */
  className?: string;
};

const ITEMS = '[role^="menuitem"]:not([aria-disabled="true"])';
const menuItems = (menu: HTMLElement | null) => Array.from(menu?.querySelectorAll<HTMLElement>(ITEMS) ?? []);

/**
 * A menu of actions that opens from a button: row actions, a user menu with a
 * role switcher. Keyboard as a menu button: arrows, Home/End and typing a
 * letter move; Escape closes and returns to the button; Tab closes and moves
 * on. It opens over everything (outside any clipping table or panel) and
 * flips to fit. Accent element: the bar on the focused item.
 */
export function Menu({ trigger, items, header, align = 'start', placement = 'bottom', label, renderLink, className }: Props) {
  const [open, setOpen] = useState<false | 'first' | 'last'>(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const ownId = useId();
  const menuId = useId();
  const triggerId = trigger.props.id ?? ownId;

  const anchor = () => wrapRef.current?.firstElementChild as HTMLElement | null | undefined;

  const show = (focus: 'first' | 'last') => {
    setHost(popoverHost(wrapRef.current));
    setOpen(focus);
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) anchor()?.focus();
  };

  // Place it by the trigger before it paints, and keep it there
  useAnchoredPosition(!!open, wrapRef, popRef, { align, placement });

  // Focus the first (or last) item; a press outside closes it
  useEffect(() => {
    if (!open) return;
    const els = menuItems(menuRef.current);
    (open === 'last' ? els.at(-1) : els[0])?.focus({ preventScroll: true });
    const onDown = (e: globalThis.PointerEvent) => {
      const target = e.target as Node;
      if (popRef.current?.contains(target) || wrapRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const els = menuItems(menuRef.current);
    const i = els.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      els[(n + els.length) % els.length]?.focus();
    };
    switch (e.key) {
      case 'ArrowDown':
        return go(i + 1);
      case 'ArrowUp':
        return go(i < 0 ? els.length - 1 : i - 1);
      case 'Home':
        return go(0);
      case 'End':
        return go(els.length - 1);
      case 'Escape':
        // Not also the dialog or drawer around it
        e.preventDefault();
        e.stopPropagation();
        return close(true);
      case 'Tab':
        // Focus goes back to the trigger first, so Tab moves on from there
        return close(true);
      case ' ':
        // Space activates links too, like buttons
        e.preventDefault();
        els[i]?.click();
        return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = e.timeStamp;
      const key = e.key.toLowerCase();
      const text = now - typed.current.at < 600 ? typed.current.text + key : key;
      typed.current = { text, at: now };
      const from = text.length === 1 ? i + 1 : Math.max(i, 0);
      const order = [...els.slice(from), ...els.slice(0, from)];
      const hit = order.find((el) => el.textContent?.trim().toLowerCase().startsWith(text));
      if (hit) {
        e.preventDefault();
        hit.focus();
      }
    }
  };

  // Items are found by id: clicks and the pointer are handled once, on the menu
  const itemId = (item: MenuItem) => `${menuId}-${item.key}`;
  const byId = new Map<string, MenuItem>();
  for (const entry of items) {
    if (entry.kind === 'group') entry.items.forEach((item) => byId.set(itemId(item), item));
    else if (entry.kind !== 'separator') byId.set(itemId(entry), entry);
  }
  const itemAt = (target: EventTarget) => {
    const el = (target as Element).closest?.<HTMLElement>('[role^="menuitem"]');
    const item = el && byId.get(el.id);
    return el && item ? { el, item } : null;
  };

  const onMenuClick = (e: MouseEvent<HTMLDivElement>) => {
    const hit = itemAt(e.target);
    if (!hit) return;
    if (hit.item.disabled) {
      e.preventDefault();
      return;
    }
    hit.item.onSelect?.();
    close(true);
  };

  // The pointer moves the focus too, so there's one highlighted item
  const onMenuPointer = (e: PointerEvent<HTMLDivElement>) => {
    const hit = itemAt(e.target);
    if (hit && !hit.item.disabled && document.activeElement !== hit.el) hit.el.focus({ preventScroll: true });
  };

  // The trigger's own handlers run first (it's inside); events from the menu, which React
  // bubbles here through the portal, aren't the trigger's
  const fromTrigger = (e: { target: EventTarget; defaultPrevented: boolean }) =>
    !e.defaultPrevented && !!wrapRef.current?.firstElementChild?.contains(e.target as Node);

  const onTriggerClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (!fromTrigger(e)) return;
    if (open) close(false);
    else show('first');
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!fromTrigger(e) || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault();
    show(e.key === 'ArrowDown' ? 'first' : 'last');
  };

  const renderItem = (item: MenuItem) => {
    const choice = item.selected !== undefined;
    const common = {
      id: itemId(item),
      role: choice ? 'menuitemradio' : 'menuitem',
      tabIndex: -1,
      className: cx(styles.item, item.tone === 'danger' && styles.danger),
      'aria-checked': choice ? item.selected : undefined,
      'aria-disabled': item.disabled || undefined,
      children: (
        <>
          {choice && <span className={styles.check} aria-hidden="true">{item.selected && <Check strokeWidth={2} />}</span>}
          {item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
          <span className={styles.label}>{item.label}</span>
        </>
      ),
    };
    if (item.href && !item.disabled) {
      const props = { ...common, href: item.href };
      return renderLink ? renderLink(props) : <a {...props} />;
    }
    return <button type="button" {...common} />;
  };

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger, {
        id: triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': !!open,
        'aria-controls': open ? menuId : undefined,
      })
    : trigger;

  return (
    <span ref={wrapRef} className={cx(styles.wrap, className)} onClick={onTriggerClick} onKeyDown={onTriggerKey}>
      {triggerEl}
      {open &&
        host &&
        createPortal(
          <div ref={popRef} className={styles.popover}>
            {header && <div className={styles.header}>{header}</div>}
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={label}
              aria-labelledby={label ? undefined : triggerId}
              className={styles.menu}
              onKeyDown={onMenuKey}
              onClick={onMenuClick}
              onPointerMove={onMenuPointer}
            >
              {items.map((entry) => {
                if (entry.kind === 'separator') return <div key={entry.key} role="separator" className={styles.separator} />;
                if (entry.kind === 'group') {
                  const labelId = `${menuId}${entry.key}`;
                  return (
                    <div key={entry.key} role="group" aria-labelledby={labelId} className={styles.group}>
                      <div id={labelId} role="presentation" className={styles.groupLabel}>
                        {entry.label}
                      </div>
                      {entry.items.map((item) => (
                        <Fragment key={item.key}>{renderItem(item)}</Fragment>
                      ))}
                    </div>
                  );
                }
                return <Fragment key={entry.key}>{renderItem(entry)}</Fragment>;
              })}
            </div>
          </div>,
          host,
        )}
    </span>
  );
}
