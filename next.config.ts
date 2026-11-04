import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export, so the site can be hosted anywhere.
  output: "export",
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
