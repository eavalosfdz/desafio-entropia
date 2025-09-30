import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        serverActions: {
            allowedOrigins: ["my-proxy.com", "*.my-proxy.com"],
            bodySizeLimit: "10mb",
        },
    },
};

export default nextConfig;
