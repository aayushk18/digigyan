/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  reactStrictMode: true,
};

export default nextConfig;

