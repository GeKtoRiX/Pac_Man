// Переменная пути к калогу.
const path = require("path");
// Модуль связки prod dev с common файлом.
const { merge } = require("webpack-merge");
// Common(общий) файл конфигурации WebPack.
const common = require("./webpack.common.config");

// Объединенный devСonfig с Common.
module.exports = merge(common, {
  // Мод разработчика.
  mode: "development",
  // Указание источников ошибок
  devtool: "inline-source-map",
  // Настройка локального сервера.
  devServer: {
    // Путь создание сервера.
    static: {
      directory: path.resolve(__dirname, "./dist"),
    },
    // Порт подключения.
    port: 8080,
    // Запись и обработка файлов не из оперативной памяти, а с жеского диска.
    devMiddleware: {
      writeToDisk: true,
    },
    // Автоматическое открытие страницы.
    open: true,
  },
  //   Модуль WebPack.
  module: {
    //  Условия(правила) использования модуля.
    rules: [
      // Использование модулей для css и style элементов.
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
});
