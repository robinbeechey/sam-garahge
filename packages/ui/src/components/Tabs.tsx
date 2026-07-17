import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';

export interface Tab {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  basePath: string;
  className?: string;
}

export function Tabs({ tabs, basePath, className }: TabsProps) {
  const location = useLocation();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  // Edge fades signal that the strip scrolls: surfaces like admin (13 tabs) and
  // project settings (7 tabs) overflow every mobile viewport, and a flush-cut
  // strip reads as complete — hiding the overflow tabs entirely.
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    updateEdges();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateEdges);
      resizeObserver.observe(el);
    }
    return () => {
      el.removeEventListener('scroll', updateEdges);
      resizeObserver?.disconnect();
    };
  }, [updateEdges]);

  function getFullPath(tab: Tab): string {
    const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    return `${base}/${tab.path}`;
  }

  function isActive(tab: Tab): boolean {
    const full = getFullPath(tab);
    return location.pathname === full || location.pathname.startsWith(full + '/');
  }

  // Keep the active tab visible: deep links (e.g. /settings/advanced) land with
  // the active tab scrolled out of view otherwise.
  const activeIndex = tabs.findIndex((tab) => isActive(tab));
  useEffect(() => {
    if (activeIndex < 0) return;
    tabRefs.current[activeIndex]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeIndex]);

  function handleKeyDown(e: KeyboardEvent, index: number) {
    let nextIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
    }

    if (nextIndex !== null) {
      tabRefs.current[nextIndex]?.focus();
    }
  }

  const fadeBase =
    'pointer-events-none absolute inset-y-0 w-8 from-[var(--sam-color-bg-canvas)] to-transparent';

  return (
    <div className={`relative overflow-hidden glass-chrome border-b ${className ?? ''}`}>
      <div role="tablist" ref={listRef} className="flex overflow-x-auto snap-x snap-mandatory">
        {tabs.map((tab, index) => {
          const active = isActive(tab);
          return (
            <NavLink
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              to={getFullPath(tab)}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`sam-type-secondary inline-flex items-center gap-2 px-4 py-2 border-none border-b-2 bg-transparent no-underline whitespace-nowrap cursor-pointer snap-start transition-[color,border-color] duration-150 ease-in-out hover:text-fg-primary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:-outline-offset-2 ${active ? 'text-fg-primary border-b-[var(--sam-tabs-active-border)]' : 'text-fg-muted border-b-transparent'}`}
            >
              {tab.icon}
              {tab.label}
            </NavLink>
          );
        })}
      </div>
      {edges.left && <div aria-hidden className={`${fadeBase} left-0 bg-gradient-to-r`} />}
      {edges.right && <div aria-hidden className={`${fadeBase} right-0 bg-gradient-to-l`} />}
    </div>
  );
}
