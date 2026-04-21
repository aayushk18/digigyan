/** @type {import('next').NextConfig} */


const nextConfig = {

  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  reactStrictMode: true,

};

export default nextConfig;

