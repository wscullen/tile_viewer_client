const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { spawn } = require('child_process')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = path.resolve(__dirname, 'src')

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          { loader: 'postcss-loader' },
        ],
        include: [defaultInclude, path.resolve(__dirname, '/../../node_modules/ol/ol.css')],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        use: [{ loader: 'babel-loader' }],
        include: defaultInclude,
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude,
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Tile Viewer',
      options: { viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css',
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    stats: {
      colors: true,
      chunks: false,
      children: false,
    },
    historyApiFallback: true,
    before() {
      spawn('electron', ['.'], { shell: true, env: process.env, stdio: 'inherit' })
        .on('close', code => process.exit(0))
        .on('error', spawnError => console.error(spawnError))
    },
  },
}
