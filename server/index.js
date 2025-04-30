require('dotenv').config();
const errorMiddlewares = require('./midllewares/errorMiddlewares')
const express = require('express');
const sequelize = require('./db');
const {version, validate} = require('uuid');
const models = require('./models');  
const cors = require('cors');
const http = require('http'); 
const router2 = require('./routes/index');
const { v4: uuidv4 } = require('uuid'); 
const app = express();
require('dotenv').config({ path: '../.env' });  
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');
const path = require('path');
const { initializeSocketHandlers } = require('./socket/mediasoupHandler');


app.use(cors({
  origin: ['http://localhost:3000', 'https://kucherenkoaleksanr.ru'], 
  credentials: true  
}));
app.use(express.json());  



app.use('/api', router2);  
app.use(errorMiddlewares);  
app.use('/sfu/:room', express.static(path.join(__dirname, 'public')))

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',  
    methods: '*', 
    credentials: true,  
  },
});

initializeSocketHandlers(io);

const start = async () => {
  try {
    await sequelize.authenticate();  
    await sequelize.sync({ alter: true });  
    server.listen(process.env.SERVER_PORT, () => {
      console.log(`Сервер запущен на порту ${process.env.SERVER_PORT}`);
    });
  } catch (e) {
    console.error('Ошибка при запуске сервера:', e);
  }
};

start();
