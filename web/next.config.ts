import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (!process.env.API_URL) {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.module.less": {
        loaders: ["less-loader"],
        as: "*.module.css",
      },
    },
  },
};

export default nextConfig;
