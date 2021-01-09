const path = require("path");
module.exports = {
  mode: "development",
  entry: "./src/server.ts",
  resolve: {
    extensions: [".ts", ".tsx", /*for graphql*/ ".mjs", ".js", ".json"],
  },
  devtool: "inline-source-map",
  output: {
    path: path.join(__dirname, "dist/"),
    filename: "app.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  target: "node",
};
