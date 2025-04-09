const { Router } = require('express');

const userController = require('./../controllers/userController');
const authmiddleware = require('../midllewares/authMiddlewares');
const roomController = require('./../controllers/roomController')
const ConferenceFileController = require('./../controllers/conferenceFileController')
const ParticipantController = require('./../controllers/ParticipantController')

const router2 = Router();


router2.post('/registration', userController.registration);

router2.post('/login', userController.login);

router2.post('/logout', userController.logout);

router2.post('/refresh', userController.refresh);

router2.get('/users', authmiddleware, userController.getUsers);
router2.post('/createRoom', roomController.createConference);
router2.post('/enterRoom', roomController.getConferenceByAccessCode);
router2.get('/getconferenceFile/:id', ConferenceFileController.getAllFiles);
router2.get('/getAllParticipants', ParticipantController.getAllParticipants);
router2.get('/download/:id', ConferenceFileController.downloadFile); 
router2.patch('/files/:fileId/users/:userId/status', 
    ConferenceFileController.markFileAsDeleted
  );

module.exports = router2;  
