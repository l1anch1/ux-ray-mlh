/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase API body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Disable image optimization for external images
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
