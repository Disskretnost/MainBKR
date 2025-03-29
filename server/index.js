require('dotenv').config();
const errorMiddlewares = require('./midllewares/errorMiddlewares')
const express = require('express');
const sequelize = require('./db');
const {version, validate} = require('uuid');
const models = require('./models');  
const cors = require('cors');
const http = require('http');  // Для создания HTTP сервера
const router2 = require('./routes/index');
const { v4: uuidv4 } = require('uuid'); // Импортируем функцию
const app = express();
require('dotenv').config({ path: '../.env' });  // Указываем путь к файлу .env на один уровень выше
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');
const path = require('path');
const { initializeSocketHandlers } = require('./socket/mediasoupHandler');

app.use(cors({
  origin: ['http://localhost:3000', 'https://kucherenkoaleksanr.ru'], 
  credentials: true  // Разрешите отправку кук (если это действительно нужно)
}));
app.use(express.json());  // Для парсинга JSON в запросах


// Настроим маршруты

app.use('/api', router2);  // API маршруты
app.use(errorMiddlewares);  // Промежуточное ПО для обработки ошибок
app.use('/sfu/:room', express.static(path.join(__dirname, 'public')))

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',  // Разрешить все источники
    methods: '*',  // Разрешить все методы
    credentials: true,  
  },
});

initializeSocketHandlers(io);

// Запуск сервера
const start = async () => {
  try {
    await sequelize.authenticate();  // Подключаемся к базе данных
    await sequelize.sync({ alter: true });  // Синхронизируем модели с базой данных

    // Запускаем сервер на том же порту
    server.listen(process.env.SERVER_PORT, () => {
      console.log(`Сервер запущен на порту ${process.env.SERVER_PORT}`);
    });
  } catch (e) {
    console.error('Ошибка при запуске сервера:', e);
  }
};

start();
