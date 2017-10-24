const webpack = require('webpack')
const path = require('path')

const config = {
  context: path.resolve(__dirname, 'src'),
  entry: ['babel-polyfill', './logic/app.js'],
  output: {
    
    // Build our code into our SPA bundle file
    path: path.resolve(__dirname, 'dist'),
    filename: 'spa.bundle.min.js'
  },
  resolve: {
    modules: ['node_modules', 'logic', 'plumbing']
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', { modules: false }]
          ]
        }
      }]
    }]
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

module.exports = config