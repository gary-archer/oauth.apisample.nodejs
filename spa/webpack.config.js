const path = require('path');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: ['babel-polyfill', './logic/app.ts'],
  output: {
    
    // Build our code into our SPA bundle file
    path: path.resolve(__dirname, 'dist'),
    filename: 'spa.bundle.min.js'
  },
  resolve: {
    'modules': ['node_modules', 'logic', 'plumbing']
  },
  module: {
    rules: [
      // All files with a '.ts' extension will be handled by the Typescript loader
      { test: /\.ts$/, loader: "ts-loader" },

      // All output '.js' files will be polyfilled babelified.
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      
      // Build 3rd party code into a Vendor bundle file
      name: 'Oidc',
      filename: '../dist/vendor.bundle.min.js',
      minChunks (module) {
          return module.context && module.context.indexOf('node_modules') !== -1;
      }
    })
  ]
}