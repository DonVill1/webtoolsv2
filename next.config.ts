import type { NextConfig } from 'next';

const isPreview =
  process.env.VERCEL_ENV !== undefined && process.env.VERCEL_ENV !== 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // v1 -> v2. Most v1 tool URLs already resolve to the same path in v2 and must
  // stay untouched; only retired surfaces are redirected. `/tools/text-analyzer`,
  // `/tools/markdown-editor` and `/tools/qr-code-generator` were 404s in v1 but
  // are real v2 pages, so they deliberately have no rule here. If v1's Netlify
  // config is reused, delete its redirects for those three paths first.
  //
  // The editorial surface moved from `/guides` to `/blog` so the primary nav
  // matches the URLs. The order matters: topics must be matched before :slug.
  async redirects() {
    return [
      { source: '/guides', destination: '/blog', statusCode: 301 },
      { source: '/guides/topics/:topic', destination: '/blog/topics/:topic', statusCode: 301 },
      { source: '/guides/:slug', destination: '/blog/:slug', statusCode: 301 },
      { source: '/test-enhanced-system-info', destination: '/tools/system-info', statusCode: 301 },
      { source: '/tools/code-formatter', destination: '/tools/json-validator', statusCode: 301 },
      { source: '/tools/cron-scheduler', destination: '/tools', statusCode: 301 },
    ];
  },
  async headers() {
    if (!isPreview) return [];
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
