const path = require('path');
const webpack = require('webpack');

module.exports = {
  
  // The working folder
  context: path.resolve(__dirname, 'src'),

  // The compiler will pull in all Javascript dependencies starting from our entry point source file
  entry: ['babel-polyfill', './logic/app.ts'],
  output: {
    
    // Build our code into our SPA bundle file
    path: path.resolve(__dirname, 'dist'),
    filename: 'spa.bundle.min.js'
  },
  resolve: {

    // Tell import statements which file extensions to look for
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      // Files with a .js extension are loaded by the typescript loader
      {test: /\.js$/, loader: 'babel-loader'},

      // Files with a .ts extension are loaded by the typescript loader
      {test: /\.ts$/, loader: 'ts-loader'}
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      
      // Build 3rd party code into a Vendor bundle file
      name: 'vendor',
      filename: '../dist/vendor.bundle.min.js',
      minChunks (module) {
          return module.context && module.context.indexOf('node_modules') !== -1;
      }
    })
  ]
}