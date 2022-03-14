// .css файл элемента id="canvas".
import "./styles/canvasStyles.css";
// Доступ к холсту.
const htmlCanvas = document.getElementById("canvas");
const canvas = htmlCanvas.getContext("2d");
// Доступ к игровому счету на HTML странице.
const htmlGameScore = document.querySelector(".gameScore").lastChild;
// Локальный игровой счетчик.
let localGameScore = 0;
// Определение ширины и высоты холста равную окну браузера.
htmlCanvas.width = 450;
htmlCanvas.height = 530;

/*==========VARIABLES_START===========*/
// Толщина стенок блоков.
const wall_width = 5;
// Радиус окружности игрока.
const player_radius = 15;
// Радиус окружности Гранул.
const pellet_radius = 3;
// Радиус окружности Усилений.
const powerUp_radius = 7;
// Последняя нажатая клавиша.
let lastKey = "";
// Номер текущего кадра игрового поля.
let animateId = 0;
/*==========VARIABLES_END============*/

/*==========CLASSES_START===========*/
// Блоки игрового поля.
class Boundary {
  // Статичные значения ширины и длины блоков.
  static width = 40;
  static height = 40;
  // Контсруктор блоков по умолчанию.
  constructor({ position }) {
    // Координаты блока.
    this.position = position;
    // Ширина блока.
    this.width = 40;
    // Высота блока.
    this.height = 40;
  }
  // Отрисовка начального блока.
  draw() {
    // Цвет стенок блока.
    canvas.strokeStyle = "blue";
    // Толщина стенок блока.
    canvas.lineWidth = wall_width;
    // Координатная отрисовка блока.
    canvas.strokeRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}
// Гранулы.
class Pellet {
  // Статичные свойства и значения Гранулы.
  constructor({ position }) {
    // Координаты Гранулы.
    this.position = position;
    // Радиус окружности гранулы.
    this.radius = pellet_radius;
  }
  // Статичная отрисовка гранулы.
  draw() {
    canvas.fillStyle = "orange";
    canvas.beginPath();
    canvas.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    canvas.fill();
    canvas.closePath();
  }
}
// Гранулы.
class PowerUp {
  // Статичные свойства и значения Гранулы.
  constructor({ position }) {
    // Координаты Гранулы.
    this.position = position;
    // Радиус окружности гранулы.
    this.radius = powerUp_radius;
  }
  // Статичная отрисовка гранулы.
  draw() {
    canvas.fillStyle = "gold";
    canvas.beginPath();
    canvas.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    canvas.fill();
    canvas.closePath();
  }
}
// Призраки.
class Ghost {
  // Общая скорость для всех призраков.
  static speed = 2;
  // Статичные свойства и значения Игрока.
  constructor({ position, velocity, color = "#FF6347" }) {
    // Координаты Игрока.
    this.position = position;
    // Ускорение Игрока.
    this.velocity = velocity;
    // Радиус окружности игрока.
    this.radius = player_radius;
    // Цвет призрака.
    this.color = color;
    // Предыдущее состояние коллизий призрака.
    this.prevCollisions = [];
    // Скорость каждого призрака.
    this.speed = 2;
    // Чувство страха призрака.
    this.scared = false;
  }
  // Статичная отрисовка Игрока.
  draw() {
    canvas.fillStyle = this.scared ? "blue" : this.color;
    canvas.beginPath();
    canvas.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    canvas.fill();
    canvas.closePath();
  }
  // Динамическая отрисовка игрока.
  update() {
    // Отрисовка Игрока с текущими свойствами и значениями.
    this.draw();
    // Изменение координат Игрока на величину скорости.
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  // Сброс ускорения игрока.
  resetVelocity() {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }
}
// Игрок.
class Player {
  // Статичные свойства и значения Игрока.
  constructor({ position, velocity }) {
    // Координаты Игрока.
    this.position = position;
    // Ускорение Игрока.
    this.velocity = velocity;
    // Радиус окружности игрока.
    this.radius = player_radius;
    // Угол кусь в радианах
    this.radians = 0.75;
    // Скорость кусь.
    this.openRate = 0.12;
    // Направление кусь.
    this.rotation = 0;
  }
  // Статичная отрисовка Игрока.
  draw() {
    // Сохранение состояния холста.
    canvas.save();
    // Перемещение центра ротации холста на местоположение игрока.
    canvas.translate(this.position.x, this.position.y);
    canvas.rotate(this.rotation);
    // Возврат центра ротации холста в исходное положение.
    canvas.translate(-this.position.x, -this.position.y);
    canvas.fillStyle = "gold";
    canvas.beginPath();
    canvas.arc(
      this.position.x,
      this.position.y,
      this.radius,
      // Начало отрисовки окружности на 0.75 радиан от нуля.
      this.radians,
      // Конец отрисовки окружности на 0.75 радиан до нуля(360 градусов).
      Math.PI * 2 - this.radians,
      false
    );
    // Вырез треугольника из соединенных линий radStart -> radEnd -> rPlayer ->radStart.
    canvas.lineTo(this.position.x, this.position.y);
    canvas.fill();
    canvas.closePath();
    // Восстановление состояния холста.
    canvas.restore();
  }
  // Динамическая отрисовка игрока.
  update() {
    // Отрисовка Игрока с текущими свойствами и значениями.
    this.draw();
    // Изменение координат Игрока на величину скорости.
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Изменение направления открытия-закрытия рта при кусь.
    if (this.radians < 0 || this.radians > 0.75) {
      this.openRate = -this.openRate;
    }
    this.radians += this.openRate;
  }
  // Сброс ускорения игрока.
  resetVelocity() {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }
}
/*==========CLASSES_END============*/

/*==========ARRAYS_START===========*/
// Положения нажатых или отжатых клавиш.
const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
};
// Карта отрисовки блоков игрового поля.
const map = [
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", " ", " ", " ", " ", "p", " ", " ", " ", " ", "-"],
  ["-", " ", "-", " ", "-", "-", "-", " ", "-", " ", "-"],
  ["-", " ", " ", " ", " ", "-", " ", " ", " ", " ", "-"],
  ["-", " ", "-", "-", "p", " ", "p", "-", "-", " ", "-"],
  ["-", " ", " ", " ", " ", "-", " ", " ", " ", " ", "-"],
  ["-", "p", "-", " ", "-", "-", "-", " ", "-", "p", "-"],
  ["-", " ", " ", " ", " ", "-", " ", " ", " ", " ", "-"],
  ["-", " ", "-", "-", "p", " ", "p", "-", "-", " ", "-"],
  ["-", " ", " ", " ", " ", "-", " ", " ", " ", " ", "-"],
  ["-", " ", "-", " ", "-", "-", "-", " ", "-", " ", "-"],
  ["-", " ", " ", " ", " ", "p", " ", " ", " ", " ", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
];
// Массив блоков игрового поля.
const boundaries = [];
// Массив гранул на игровом поле.
const pellets = [];
// Массив усилений на игровом поле.
const powerUps = [];
// Массив призраков на игровом поле.
const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2 + wall_width,
      y: Boundary.height + Boundary.height / 2 + wall_width,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2 + wall_width,
      y: Boundary.height * 5 + Boundary.height / 2 + wall_width,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "green",
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2 + wall_width,
      y: Boundary.height * 7 + Boundary.height / 2 + wall_width,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "yellow",
  }),
];
// Заполнение игрового поля блоками по вертикали.
map.forEach((row, i) => {
  // Заполнение игрового поля блоками по горизонтали.
  row.forEach((symbol, j) => {
    // Чтение символов из карты отрисовки блоков.
    switch (symbol) {
      // Символ заполнения границ игрового поля.
      case "-":
        // Создание блока и помещение в массив.
        boundaries.push(
          new Boundary({
            position: {
              // Строка блоков с учетом толщины стенки по горизонтали.
              x: Boundary.width * j + wall_width,
              // Ряд блоков с учетом толщины стенки по вертикали.
              y: Boundary.height * i + wall_width,
            },
          })
        );
        break;
      case "p":
        // Создание блока и помещение в массив.
        powerUps.push(
          new PowerUp({
            position: {
              // Строка блоков с учетом толщины стенки по горизонтали.
              x: Boundary.width * j + wall_width + Boundary.width / 2,
              // Ряд блоков с учетом толщины стенки по вертикали.
              y: Boundary.height * i + wall_width + Boundary.width / 2,
            },
          })
        );
        break;
      case " ":
        // Создание гранулы и помещение ее в массив.
        pellets.push(
          new Pellet({
            position: {
              x: Boundary.width * j + wall_width + Boundary.width / 2,
              y: Boundary.height * i + wall_width + Boundary.width / 2,
            },
          })
        );
        break;
      default:
        break;
    }
  });
});
/*==========ARRAYS_END=============*/

/*==========OBJECTS_START===========*/
const player = new Player({
  // Позиция игрока c учетом толщины стены блока по x, y.
  position: {
    x: Boundary.width + wall_width + Boundary.width / 2,
    y: Boundary.height + wall_width + Boundary.width / 2,
  },
  // Ускорение игрока.
  velocity: {
    x: 0,
    y: 0,
  },
});
/*==========OBJECTS_END===========*/

/*==========FUNCTIONS_START===========*/
// Определение коллизии окружности игрока и блоков игрового поля.
function circleCollidesWithRectangle({ circle, rectangle }) {
  const padding = Boundary.width / 2 - circle.radius - 1;
  return (
    // Коллизция нижней части блока игрового поля и верхней части окружности игрока.
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    // Коллизция левой части блока игрового поля и правой части окружности игрока.
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    // Коллизия верхней части блока и нижней части окружности игрока.
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    // Коллизия правой части блока и левой части окружности игрока.
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
}
// Отрисовка кадров игрового поля.
function animate() {
  /*==========GAME_CANVAS_START===========*/
  // Рекурсия раскадровки игрового поля.
  animateId = window.requestAnimationFrame(animate);
  // Заливка игрового поля после рекурсионного вызова.
  canvas.fillStyle = "rgba(0, 0, 0, 0.5)";
  canvas.fillRect(0, 0, htmlCanvas.width, htmlCanvas.height);
  /*==========GAME_CANVAS_END===========*/

  if (pellets.length === 0) {
    console.log("Winner!");
    cancelAnimationFrame(animateId);
  }

  // Динамическое изменение ускорения Игрока с нажатием клавищ.
  if (keys.w.pressed && lastKey === "w") {
    // Определение коллизий окружности игрока и блоков игрового поля.
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности игрока с измененным ускорением.
            ...player,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -5;
      }
    }
  } else if (keys.a.pressed && lastKey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности игрока с измененным ускорением.
            ...player,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -5;
      }
    }
  } else if (keys.s.pressed && lastKey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности игрока с измененным ускорением.
            ...player,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = 5;
      }
    }
  } else if (keys.d.pressed && lastKey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности игрока с измененным ускорением.
            ...player,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = 5;
      }
    }
  }

  /*==========GAME_BLOCKS_START===========*/
  // Отрисовка всех блоков игрового поля и коллизия окружности и блоков без нажатия клавиш.
  boundaries.forEach((boundary) => {
    boundary.draw();
    // Коллизии окружности игрока и блоков игрового поля без нажатия клавиш действия.
    if (circleCollidesWithRectangle({ circle: player, rectangle: boundary })) {
      // Сброс ускорения игрока перед след. кадром отрисовки.
      player.resetVelocity();
    }
  });
  /*==========GAME_BLOCKS_END===========*/

  /*==========GAME_PELLETS_START===========*/
  // Отрисовка всех гранул на игровом поле.
  for (let i = pellets.length - 1; 0 <= i; i--) {
    const pellet = pellets[i];
    if (
      // Расстояние между
      Math.hypot(
        pellet.position.x - player.position.x,
        pellet.position.y - player.position.y
      ) <
      // Соприкосновение радиусов окружностей.
      pellet.radius + player.radius
    ) {
      pellets.splice(i, 1);
      localGameScore += 5;
      htmlGameScore.innerHTML = localGameScore;
    }
    pellet.draw();
  }
  /*==========GAME_PELLETS_END===========*/

  /*==========GAME_POWER_UPS_START===========*/
  // Удаление призрака при соприкосновении.
  for (let i = ghosts.length - 1; 0 <= i; i--) {
    const ghost = ghosts[i];
    if (
      // Расстояние между игроком и призраком.
      Math.hypot(
        ghost.position.x - player.position.x,
        ghost.position.y - player.position.y
      ) <
      // Соприкосновение радиусов окружностей.
      ghost.radius + player.radius
    ) {
      // Удаление напуганного призрака при соприкосновении.
      if (ghost.scared) {
        ghosts.splice(i, 1);
      } else {
        // Окончание игры при косании обычного призрака.
        window.cancelAnimationFrame(animateId);
        console.log("Game Over");
      }
    }
  }
  // Удаление усилдений с игрового поля.
  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i];
    if (
      // Расстояние между
      Math.hypot(
        powerUp.position.x - player.position.x,
        powerUp.position.y - player.position.y
      ) <
      // Соприкосновение радиусов окружностей.
      powerUp.radius + player.radius
    ) {
      powerUps.splice(i, 1);
      // Испуг призрака.
      ghosts.forEach((ghost) => {
        ghost.scared = true;
        // Возварт в нормальное состояние через 5 секунд.
        setTimeout(() => {
          ghost.scared = false;
        }, 5000);
      });
      localGameScore += 10;
      htmlGameScore.innerHTML = localGameScore;
    }
    powerUp.draw();
  }
  /*==========GAME_POWER_UPS_END===========*/

  /*==========GAME_GHOSTS_START===========*/
  // Отрисовка призраков на игровом поле.
  ghosts.forEach((ghost) => {
    ghost.update();
    // Массив хранения локальных коллизий призраков с блоками игрового поля.
    const collisions = [];
    boundaries.forEach((boundary) => {
      // Работа с коллизиями справа от призрака.
      if (
        !collisions.includes("right") &&
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности призрака с измененным ускорением.
            ...ghost,
            velocity: {
              x: ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        // Добавление информации о правой коллизии призрака в массив.
        collisions.push("right");
      }
      // Работа с коллизиями слева от призрака.
      if (
        !collisions.includes("left") &&
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности призрака с измененным ускорением.
            ...ghost,
            velocity: {
              x: -ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        // Добавление информации о правой коллизии призрака в массив.
        collisions.push("left");
      }
      // Работа с коллизиями сверху от призрака.
      if (
        !collisions.includes("up") &&
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности призрака с измененным ускорением.
            ...ghost,
            velocity: {
              x: 0,
              y: -ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        // Добавление информации о верхней коллизии призрака в массив.
        collisions.push("up");
      }
      // Работа с коллизиями снизу от призрака.
      if (
        !collisions.includes("down") &&
        circleCollidesWithRectangle({
          circle: {
            // Копия окружности призрака с измененным ускорением.
            ...ghost,
            velocity: {
              x: 0,
              y: ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        // Добавление информации о верхней коллизии призрака в массив.
        collisions.push("down");
      }
    });
    // Избегание добавления нулевого значения локального массива коллизий призрака.
    if (collisions.length > ghost.prevCollisions.length) {
      // Добавление найденных коллизий призрака внутрь его объекта.
      ghost.prevCollisions = collisions;
    }
    // Сравнение локальных коллизий и коллизий внутри объекта призрака.
    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
      // Предполагаемая коллизия при движении вправо.
      if (ghost.velocity.x > 0 && !ghost.prevCollisions.includes("right")) {
        ghost.prevCollisions.push("right");
      }
      // Предполагаемая коллизия при движении влево.
      else if (ghost.velocity.x < 0 && !ghost.prevCollisions.includes("left")) {
        ghost.prevCollisions.push("left");
      }
      // Предполагаемая коллизия при движении вверх.
      else if (ghost.velocity.y < 0 && !ghost.prevCollisions.includes("up")) {
        ghost.prevCollisions.push("up");
      }
      // Предполагаемая коллизия при движении вниз.
      else if (ghost.velocity.y > 0 && !ghost.prevCollisions.includes("down")) {
        ghost.prevCollisions.push("down");
      }

      console.log("localCurrentCol: " + collisions);
      console.log("ghostPrevCol: " + ghost.prevCollisions);

      // Удаление дублирующихся коллизий из объекта призрака.
      const pathways = ghost.prevCollisions.filter((collision) => {
        // Возврат разных коллизий в локальном массиве и в массиве призрака.
        return !collisions.includes(collision);
      });
      console.log({ pathways });
      // Случайное направление движения призрака.
      const direction = pathways[Math.floor(Math.random() * pathways.length)];
      console.log({ direction });

      switch (direction) {
        case "down":
          ghost.velocity.y = ghost.speed;
          ghost.velocity.x = 0;
          break;
        case "up":
          ghost.velocity.y = -ghost.speed;
          ghost.velocity.x = 0;
          break;
        case "right":
          ghost.velocity.x = ghost.speed;
          ghost.velocity.y = 0;
          break;
        case "left":
          ghost.velocity.x = -ghost.speed;
          ghost.velocity.y = 0;
          break;
        default:
          break;
      }
      // Сброс свойтв коллизий призрака.
      ghost.prevCollisions = [];
    }
  });
  /*==========GAME_GHOSTS_END===========*/

  /*==========GAME_PLAYER_START===========*/
  // Отрисовка Игрока.
  player.update();
  // Динамическое изменение ускорения Игрока.
  if (keys.w.pressed && lastKey === "w") {
    player.velocity.y = -5;
  } else if (keys.a.pressed && lastKey === "a") {
    player.velocity.x = -5;
  } else if (keys.s.pressed && lastKey === "s") {
    player.velocity.y = 5;
  } else if (keys.d.pressed && lastKey === "d") {
    player.velocity.x = 5;
  }
  // Изменение направления кусь впарво.
  if (player.velocity.x > 0) {
    player.rotation = 0;
  }
  // Изменение направления кусь влево.
  else if (player.velocity.x < 0) {
    player.rotation = Math.PI;
    // Изменение направления кусь вниз.
  } else if (player.velocity.y > 0) {
    player.rotation = Math.PI / 2;
    // Изменение направления кусь вверх.
  } else if (player.velocity.y < 0) {
    player.rotation = -Math.PI / 2;
  }
  /*==========GAME_PLAYER_END===========*/
}
/*==========FUNCTIONS_END============*/

/*==========ACTIVE_START=============*/
// Рекурсия раскадровки игрового поля.
animate();
/*==========ACTIVE_END==============*/

/*==========LISTENERS_START=============*/
// Передвижение Игрока по игровому полю при нажатии клавиш WASD.
window.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      // Изменение положение нажатой клавиши.
      keys.w.pressed = true;
      // Изменение последней нажатой клавиши.
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
    default:
      console.log("undefined key");
      break;
  }
  console.log(player.velocity);
});
// Остановка игрока при отжатии клавиш управления WASD.
window.addEventListener("keyup", ({ key }) => {
  switch (key) {
    // Изменение положение отжатой клавиши.
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    default:
      console.log("undefined key");
      break;
  }
});
/*==========LISTENERS_END=============*/
