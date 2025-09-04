const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const { getUser, getAllUserTotalExpenseIfIsPremium } = require('../controllers/userController');
const router = express.Router();

router.get('/', authenticateToken, getUser);
router.get('/premium/showleaderboad', authenticateToken, getAllUserTotalExpenseIfIsPremium);


module.exports = router;
