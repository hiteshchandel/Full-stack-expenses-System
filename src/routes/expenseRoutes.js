const express = require('express');
const { createExpense, getExpenses, deleteExpense, updateExpense } = require('../controllers/expenseController');
const { authenticateToken } = require('../utils/jwt');
const router = express.Router();


router.post('/add',authenticateToken ,createExpense);
router.get('/get',authenticateToken, getExpenses);
router.delete('/delete/:id', authenticateToken, deleteExpense);
router.put('/update/:id', authenticateToken, updateExpense);

module.exports = router;