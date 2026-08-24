/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static-first: prerender everything we can. See CLAUDE.md.
  reactStrictMode: true,

  async redirects() {
    return [
      // exit260.com is retired; the domain points at the Exit 260 location page.
      // See CLAUDE.md. The host match is added when the domain is attached in Vercel.
      { source: "/exit260", destination: "/locations/exit-260", permanent: true },
    ];
  },
};

export default nextConfig;
