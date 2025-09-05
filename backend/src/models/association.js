const User = require('./User');
const Expense = require('./Expense');
const ForgotPassword = require('./forgotPassword');
const sequelize = require('../config/db');

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ForgotPassword, { foreignKey: 'userId', onDelete: 'CASCADE' });
ForgotPassword.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Expense, ForgotPassword , sequelize};