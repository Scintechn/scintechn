import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site-data';

/**
 * Generated robots.txt — replaces the former public/robots.txt (a static file
 * of the same name in public/ silently wins over this route, so it must stay
 * deleted).
 *
 * The AI crawlers are listed explicitly rather than left to the `*` rule: the
 * site *wants* to be read by assistants and answer engines, and naming the
 * agents makes that intent auditable instead of implied.
 */

const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'meta-externalagent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // POST-only endpoints — nothing to index, and no reason to crawl them.
        disallow: '/api/',
      },
      {
        userAgent: AI_AGENTS,
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: `${SITE.baseUrl}/sitemap.xml`,
  };
}
