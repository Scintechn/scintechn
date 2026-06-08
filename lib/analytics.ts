// Unified analytics helper.
//
// Fans events out to two sinks:
//  1. GTM dataLayer — bootstrapped in app/[locale]/layout.tsx (GTM-KPXTTSRQ).
//  2. Vercel Analytics — <Analytics /> mounted in the same layout. Vercel
//     auto-tracks page views; this only mirrors custom events.
//
// Safe to call from any client component (no-op during SSR or before the
// sinks load). Fire-and-forget; we never await acknowledgement.

import { track as vercelTrack } from '@vercel/analytics';

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

  try {
    vercelTrack(event, props);
  } catch {
    // Vercel Analytics not loaded yet or disabled — ignore.
  }
}
