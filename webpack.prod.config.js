const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// Модуль связки prod dev с common файлом.
const { merge } = require("webpack-merge");
// Common(общий) файл конфигурации WebPack.
const common = require("./webpack.common.config");

// Объединенный ProdСonfig с Common.
module.exports = merge(common, {
  // Мод разработчика.
  mode: "production",
  //   Модуль WebPack.
  module: {
    //  Условия(правила) использования модуля.
    rules: [
      // Использование модулей для css и style элементов.
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "styles.css" }),
    new HtmlWebPackPlugin({
      template: "index.html",
    }),
    new CleanWebpackPlugin(),
  ],
});
