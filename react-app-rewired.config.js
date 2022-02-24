const webpack = require("webpack");

/**
 * React App Rewired Config
 */
module.exports = {
  // Update webpack config to use custom loader for worker files
  webpack: (config) => {
    // Note: It's important that the "worker-loader" gets defined BEFORE the TypeScript loader!
    config.module.rules.unshift({
      test: /\.worker\.ts$/,
      use: {
        loader: "worker-loader",
        options: {
          // Use directory structure & typical names of chunks produces by "react-scripts"
          filename: "static/js/[name].[contenthash:8].js",
        },
      },
    });

    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ]);

    return config;
  },
};
