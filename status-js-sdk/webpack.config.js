module.exports = {
  target: "node",
  mode: "production",
  entry: __dirname + "/helper.js",
  output: {
    path: __dirname,
    filename: "sdk.js",
    library: { type: "commonjs2" },
  },
  resolve: {
    // to load js-waku based on its `exports.import` in package.json
    conditionNames: ["require", "import"],
  },
  // optimization: { minimize: false },
};
