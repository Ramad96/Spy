import { useEffect } from 'react';

/**
 * While active, the browser back button (or swipe-back) does nothing,
 * so nobody can step back to an earlier player's secret.
 */
export function useBlockBack(active: boolean) {
  useEffect(() => {
    if (!active) return;
    history.pushState({ spyLock: true }, '');
    const onPop = () => history.pushState({ spyLock: true }, '');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [active]);
}
