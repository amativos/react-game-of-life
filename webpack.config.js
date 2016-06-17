const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: [
		'webpack-hot-middleware/client',
		'index'
	],

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },

  module: {
    loaders: [{
      test: /\.tsx?$/,
      loaders: ['react-hot', 'ts'],
      exclude: /node_modules/,
    }, {
      test:   /\.scss$/,
      loaders: ['style', 'css', 'sass']
    }, {
      test: /\.jpe?g$|\.gif$|\.png$|\.svg$/i,
      loader: 'url-loader?limit=10000'
    }, {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff',
    }, {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff',
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file?name=fonts/[name].[hash].[ext]&mimetype=application/octet-stream',
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file?name=fonts/[name].[hash].[ext]',
    }, {
      test: /\.html$/,
      loader: 'html-loader',
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: true,
    })
  ],
  
  resolve: {
    modulesDirectories: ['src', 'node_modules'],
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx'],
  },

  devtool: 'eval-cheap-module-source-map',
  target: 'web',
  debug: true,
  stats: false,
  progress: true,
};
