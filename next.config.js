/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["placeholder.com"], // Add any image domains you use
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
  },
  // Optimize font loading
  optimizeFonts: true,
  // Enable page preloading
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  // Minimize JavaScript
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Allow cross-origin requests during development
  devServer: {
    allowedDevOrigins: ["192.168.178.37"],
  },
};

module.exports = nextConfig;
