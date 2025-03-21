const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');  // Импортируем модель User
const Token = require('./Token');  // Импортируем модель Token

const Conference = sequelize.define('conference', {  // Переименовал в conference для соответствия
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },  // id комнаты int с автоинкрементом
  ownerId: { // Владелец комнаты (если у вас пользователи)
    type: DataTypes.INTEGER,
    allowNull: false, //  Не может быть NULL - обязательно нужен владелец
    references: {
      model: 'users', // Ссылка на таблицу пользователей
      key: 'id'
    },
    onDelete: 'CASCADE'  // Если пользователь удален, то и комната удаляется.
  },
  accessCode: {  // Код доступа
    type: DataTypes.STRING,
    allowNull: false,
    unique: true  // Уникальный для каждой комнаты
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // По умолчанию комната активна
  }
}, {
  timestamps: false  // Убираем timestamps, если они не нужны
});

// Связь: Один пользователь может создавать много конференций
User.hasMany(Conference, { foreignKey: 'ownerId', as: 'conferences' }); // Добавляем алиас
Conference.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' }); // Добавляем алиас

module.exports = Conference;