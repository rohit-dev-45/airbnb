import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000",
                "shiny-fortnight-97xwp5gww499cppwj-3000.app.github.dev",
            ],
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "utfs.io",
            },
            {
                protocol: "https",
                hostname: "*.ufs.sh",
            },
        ],
    },
};

export default nextConfig;
