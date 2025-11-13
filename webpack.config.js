const path = require("path");
const webpack = require('webpack')
const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  entry: {
    main: "./chatbot/index.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "public"),
  },
  devServer: {
    static: [
      { directory: path.resolve(__dirname, "chatbot", "html") },
      { directory: path.resolve(__dirname, "public") },
    ],
    port: 3002,
    open: true,
    hot: true,
    compress: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: "[local]--[hash:base64:5]"
              },
            }
          }],
      },
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
