const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const ConferenceFile = require('./ConferenceFile');

const FileStatus = sequelize.define('file_status', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  fileConferenceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: ConferenceFile,
      key: 'conferenceId'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('visible', 'hidden', 'deleted', 'archived'),
    defaultValue: 'visible',
    allowNull: false
  },
  changedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  timestamps: false,
  indexes: [
    {
      fields: ['fileConferenceId']
    }
  ]
});

// Связи
User.hasMany(FileStatus, { 
  foreignKey: 'userId',
  as: 'fileStatuses'
});

FileStatus.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});

ConferenceFile.hasMany(FileStatus, { 
  foreignKey: 'fileConferenceId',
  as: 'statuses'
});

FileStatus.belongsTo(ConferenceFile, { 
  foreignKey: 'fileConferenceId',
  as: 'file'
});

module.exports = FileStatus;