/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: false,
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

export default nextConfig;
