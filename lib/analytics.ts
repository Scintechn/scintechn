// Tiny GTM dataLayer helper. The GTM container is bootstrapped in
// app/[locale]/layout.tsx (id GTM-KPXTTSRQ) which initializes
// window.dataLayer; this just pushes named events into it.
//
// Safe to call from any client component (no-op during SSR or when GTM
// hasn't loaded yet — the array is created lazily). All events are
// fire-and-forget; we never await GTM acknowledgement.

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

interface DataLayerEntry extends AnalyticsProps {
  event: string;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

export function track(event: string, props: AnalyticsProps = {}): void {
  if (typeof window === 'undefined') return;
  if (!window.dataLayer) window.dataLayer = [];
  window.dataLayer.push({ event, ...props });
}
