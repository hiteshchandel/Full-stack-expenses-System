const Expense = require('../models/Expense');

exports.createExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        console.log(req.user);
        const newExpense = await Expense.create({
            amount, description, category,
            userId: req.user.id
        });
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
        const deleteExpense = await Expense.destroy({
            where: { id },
            userId: req.user.id
        });
        if (deleteExpense) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Expense not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};