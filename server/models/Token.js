const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User'); 

const Token = sequelize.define('token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  refresh: { type: DataTypes.STRING, allowNull: false },  
  userId: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',  
      key: 'id'
    },
    onDelete: 'CASCADE' 
  }
}, { timestamps: true });

User.hasOne(Token, { foreignKey: 'userId' });
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = Token;
