const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');  
const Token = require('./Token');  

const Conference = sequelize.define('conference', {  
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },  
  ownerId: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
      model: 'users', 
      key: 'id'
    },
    onDelete: 'CASCADE'  
  },
  accessCode: {  
    type: DataTypes.STRING,
    allowNull: false,
    unique: true  
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true 
  }
}, {
  timestamps: false  
});

User.hasMany(Conference, { foreignKey: 'ownerId', as: 'conferences' }); 
Conference.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' }); 

module.exports = Conference;