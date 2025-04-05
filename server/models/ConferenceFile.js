const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Conference = require('./Conference');

const ConferenceFile = sequelize.define('conference_file', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  indexes: [
    { fields: ['conferenceId'] }
  ]
});

// Связи
Conference.hasOne(ConferenceFile, { 
  foreignKey: 'conferenceId',
  as: 'file'
});
ConferenceFile.belongsTo(Conference, {
  foreignKey: 'conferenceId',
  as: 'conference'
});

module.exports = ConferenceFile;