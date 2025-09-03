const User = require('./User');
const Expense = require('./Expense');
const sequelize = require('../config/db');

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Expense , sequelize};