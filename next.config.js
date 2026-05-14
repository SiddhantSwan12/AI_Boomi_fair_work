/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["gsap", "@xmtp/browser-sdk", "@xmtp/wasm-bindings"],
    webpack: (config, { isServer }) => {
        config.externals.push("pino-pretty", "lokijs", "encoding");

        // Enable WASM support for @react-three/rapier
        // layers: true is required in Next.js 14 for WASM to be properly chunked client-side
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        // Ignore React Native specific modules in browser builds
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                '@react-native-async-storage/async-storage': false,
            };
            config.resolve.alias = {
                ...config.resolve.alias,
                '@react-native-async-storage/async-storage': false,
            };
        }

        return config;
    },
};

module.exports = nextConfig;
