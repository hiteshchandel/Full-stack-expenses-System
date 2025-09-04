const Expense = require('../models/Expense');
const User = require('../models/User');
const { Sequelize } = require('sequelize');

exports.createExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        console.log(req.user);
        const newExpense = await Expense.create({
            amount, description, category,
            userId: req.user.id
        });
        const user = await User.findByPk(req.user.id);
        user.totalExpense = (parseFloat(user.totalExpense) || 0) + parseFloat(amount);
        await user.save();

        res.status(201).json(newExpense);
    } catch (error) {
        console.log(Error, error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { userId: req.user.id }
        });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve expenses' });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findOne({
            where: { id },
            userId: req.user.id
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const user = await User.findByPk(req.user.id);
        user.totalExpense = parseFloat(user.totalExpense) - parseFloat(expense.amount);
        await user.save();

        await Expense.destroy({
            where: { id }
        });

        res.status(204).send();        
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};