// Переменная пути к калогу.
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  // Входное местоположение файла.
  entry: "./index.js",
  // Выходное местоположение файла.
  output: {
    // Имя выходного файла.
    filename: "bundle.js",
    // Создание полного пути с указанием текущей директории и вложенной в него папки.
    path: path.resolve(__dirname, "./dist"),
  },
  //   Модуль WebPack.
  module: {
    //  Условия(правила) использования модуля.
    rules: [
      // Использование встроенного загрузчика файлов.
      { test: /\.(svg|ico|png|webp|jpg|gif|jpeg)$/, type: "asset/resource" },
      // Использование загрузчика файлов.
      {
        test: /\.(wav|mp3|ogg)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
      // Трансляция es5-6 в нативный код и исключение из проверки папку node_modules.
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          // Транслятор кода.
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "index.html",
    }),
    new CleanWebpackPlugin(),
  ],
};
