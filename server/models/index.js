const User = require('./User');  // Импортируем модель User
const Conference = require('./Conference');  // Импортируем модель Conference
const Token = require('./Token');  // Импортируем модель Token
const Participant = require('./Participant')
const Transcript = require('./Transcript')
const ConferenceFile = require("./ConferenceFile")
const FileStatus = require('./FileStatus')

// Экспортируем все модели для использования в других частях приложения
module.exports = {
  User,
  Conference,
  Token,
  Participant,
  Transcript,
  ConferenceFile,
  FileStatus 
};
