
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Conference = require('./Conference');

const Participant = sequelize.define('participant', {
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
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },  
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
}, {
  timestamps: false, 
  indexes: [
    { fields: ['conferenceId'] },
    { fields: ['userId'] },
    { fields: ['isOnline'] }
  ]
});


User.hasMany(Participant, { foreignKey: 'userId' });
Participant.belongsTo(User, { foreignKey: 'userId' });

Conference.hasMany(Participant, { foreignKey: 'conferenceId' });
Participant.belongsTo(Conference, { foreignKey: 'conferenceId' });

module.exports = Participant;