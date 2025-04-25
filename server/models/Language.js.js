const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Language = sequelize.define('languages', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  language: {
    type: DataTypes.STRING, 
    allowNull: false,
    primaryKey: true
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true
});

User.hasMany(Language, { foreignKey: 'userId', as: 'languages' });
Language.belongsTo(User, { foreignKey: 'userId' });

module.exports = Language;
