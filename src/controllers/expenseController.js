const Expense = require('../models/Expense');
const User = require('../models/User');
const sequelize = require('../config/db');
const { where } = require('sequelize');

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
        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;

        const offset = (page - 1) * limit;

        const { count, rows } = await Expense.findAndCountAll({
            where: { userId: req.user.id },
            offset,
            limit,
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            
            expenses: rows
        });
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

exports.updateExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { amount, description, category } = req.body;

        const expense = await Expense.findOne({
            where: { id, userId: req.user.id },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            res.status(404).json({ error: "Expense not found" });
        }

        const user = await User.findByPk(req.user.id, { transaction: t });
        const oldAmount = parseFloat(expense.amount);
        const newAmount = parseFloat(amount);

        user.totalExpense = (parseFloat(user.totalExpense) - oldAmount) + newAmount;
        await user.save({ transaction: t });

        expense.amount = amount;
        expense.description = description;
        expense.category = category;

        await expense.save({ transaction: t });
        await t.commit();
        res.status(200).json({ message: "expense updated successfully", expense });

    } catch (error) {
        await t.rollback();
        console.error("Error updating expense : ", error);
        res.status(500).json({ error: "Server Error" });
    }
};
