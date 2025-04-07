const path = require('node:path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode == 'development';
  return {
    entry: path.join(__dirname, 'src', 'index.ts'),
    output: {
      path: path.join(__dirname, 'lib'),
      filename: 'miniz.js',
      library: 'miniz',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      chunkFilename: 'miniz.worker.js',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'public', 'miniz.wasm'),
            to: path.join(__dirname, 'lib'),
          },
          {
            from: path.join(__dirname, 'src', 'index.html'),
            to: path.join(__dirname, 'lib', 'example.html'),
          },
        ],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    devServer: {
      port: 9000,
      hot: true,
      historyApiFallback: {
        rewrites: [{ from: /^\/$/, to: '/example.html' }],
      },
    },
  };
};
