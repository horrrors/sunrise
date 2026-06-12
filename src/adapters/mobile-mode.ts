// Mobile is a MODE, not a theme: ≤ breakpoint the <html data-mobile> attribute
// turns on the HUD baseline block in index.html. The breakpoint lives only here.
export const MOBILE_BREAKPOINT_PX = 640;

interface MediaQueryLike {
  matches: boolean;
  addEventListener(type: 'change', cb: (e: { matches: boolean }) => void): void;
}
interface RootLike {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export function watchMobileMode(matchMedia: (q: string) => MediaQueryLike, root: RootLike): void {
  const mq = matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
  const apply = (m: boolean): void => {
    if (m) root.setAttribute('data-mobile', '1');
    else root.removeAttribute('data-mobile');
  };
  apply(mq.matches);
  mq.addEventListener('change', (e) => apply(e.matches));
}
