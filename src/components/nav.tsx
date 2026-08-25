import type { ReactNode } from 'react';

/** Tiny client-side navigation matching the dashboard's pathname routing. */
export function Link({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        window.history.pushState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    >
      {children}
    </a>
  );
}
