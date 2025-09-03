const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const { getUser } = require('../controllers/userController');
const router = express.Router();

router.get('/',authenticateToken, getUser);


module.exports = router;
