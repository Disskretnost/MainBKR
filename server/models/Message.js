const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Conference = require('./Conference');

const Message = sequelize.define('message', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  conferenceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'conferences',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});


User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'sender' });

Conference.hasMany(Message, { foreignKey: 'conferenceId', as: 'messages' });
Message.belongsTo(Conference, { foreignKey: 'conferenceId', as: 'conference' });

module.exports = Message
