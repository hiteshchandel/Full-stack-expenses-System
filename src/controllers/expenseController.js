const Expense = require('../models/Expense');
const User = require('../models/User');
const sequelize = require('../config/db');

exports.createExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, description, category } = req.body;

        const newExpense = await Expense.create({
            amount,
            description,
            category,
            userId: req.user.id
        }, { transaction: t });

        const user = await User.findByPk(req.user.id, { transaction: t });
        user.totalExpense = (parseFloat(user.totalExpense) || 0) + parseFloat(amount);
        await user.save({ transaction: t });

        await t.commit();
        res.status(201).json(newExpense);
    } catch (error) {
        await t.rollback();
        console.error("❌ Error creating expense:", error);
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
        console.error("❌ Error fetching expenses:", error);
        res.status(500).json({ error: 'Failed to retrieve expenses' });
    }
};

exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        const expense = await Expense.findOne({
            where: { id, userId: req.user.id },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ error: 'Expense not found' });
        }

        const user = await User.findByPk(req.user.id, { transaction: t });
        user.totalExpense = Math.max(0, parseFloat(user.totalExpense) - parseFloat(expense.amount));
        await user.save({ transaction: t });

        await Expense.destroy({
            where: { id, userId: req.user.id },
            transaction: t
        });

        await t.commit();
        res.status(204).send();
    } catch (error) {
        await t.rollback();
        console.error("❌ Error deleting expense:", error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};
