// models/Transcript.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Conference = require('./Conference');

const Transcript = sequelize.define('transcript', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  conferenceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conference,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  message: {
    type: DataTypes.TEXT, // Use TEXT for longer transcriptions
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW // Records the exact time
  }
}, {
  timestamps: false, // Отключаем автоматические createdAt/updatedAt
  indexes: [
    { fields: ['conferenceId'] },
    { fields: ['userId'] }
  ]
});

// Define Associations (Relationships)
User.hasMany(Transcript, { foreignKey: 'userId' });
Transcript.belongsTo(User, { foreignKey: 'userId' });

Conference.hasMany(Transcript, { foreignKey: 'conferenceId' });
Transcript.belongsTo(Conference, { foreignKey: 'conferenceId' });

module.exports = Transcript;