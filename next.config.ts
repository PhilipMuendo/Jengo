import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tree-shake barrel imports from these packages so only the icons/functions
  // actually used are bundled.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
};

export default nextConfig;
