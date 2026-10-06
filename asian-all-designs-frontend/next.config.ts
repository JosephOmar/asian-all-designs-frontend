import type { NextConfig } from "next";

const r2ImageHostname = process.env.NEXT_PUBLIC_IMAGE_HOST ?? "aas-images.gtr-and-bi-joseph-mt.win";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: r2ImageHostname, pathname: "/products/**" }],
  },
};

export default nextConfig;
