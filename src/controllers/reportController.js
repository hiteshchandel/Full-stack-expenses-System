const { Parser } = require('json2csv');
const Expense = require('../models/Expense');

function filterExpenses(expenses, filterType) {
    const now = new Date();
    filterType = filterType.toLowerCase();

    return expenses.filter(exp => {
        const expDate = new Date(exp.createdAt);

        if (filterType === 'daily') {
            return expDate.toDateString() === now.toDateString();
        } else if (filterType === 'weekly') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7); // Next Sunday
            return expDate >= startOfWeek && expDate < endOfWeek;
        } else if (filterType === 'monthly') {
            return (
                expDate.getMonth() === now.getMonth() &&
                expDate.getFullYear() === now.getFullYear()
            );
        }
        return true; // all
    });
}

exports.generateReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { filter } = req.query;

        const expenses = await Expense.findAll({ where: { userId } });
        if (!expenses.length) {
            return res.status(404).json({ message: "No expenses Found" });
        }

        const filtered = filterExpenses(expenses, filter || 'all');
        return res.json({ success: true, data: filtered });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating report" });
    }
};

exports.downloadReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { filter } = req.query;

        const expenses = await Expense.findAll({ where: { userId } });
        if (!expenses.length) {
            return res.status(404).json({ message: "No expenses Found" });
        }

        const filtered = filterExpenses(expenses, filter || 'all');

        const fields = ["id", "amount", "description", "category", "createdAt"];
        const parser = new Parser({ fields });
        const csv = parser.parse(filtered.map(exp => exp.toJSON()));

        res.header("Content-Type", "text/csv");
        res.attachment(`expense-report-${filter || "all"}.csv`);
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error downloading report" });
    }
};
