module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    "stream": require.resolve("stream-browserify"),
                    "buffer": require.resolve("buffer/"),
                    "util": require.resolve("util/"),
                    "crypto": require.resolve("crypto-browserify"),
                    "process": require.resolve("process/browser"),
                }
            }
        }
    }
}; 