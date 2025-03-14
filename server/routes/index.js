const { Router } = require('express');

const userController = require('./../controllers/userController');
const authmiddleware = require('../midllewares/authMiddlewares');

const router2 = Router();


router2.post('/registration', userController.registration);

router2.post('/login', userController.login);

router2.post('/logout', userController.logout);

router2.post('/refresh', userController.refresh);

router2.get('/users', authmiddleware, userController.getUsers);

module.exports = router2;  
