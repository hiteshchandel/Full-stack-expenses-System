const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ForgotPassword = sequelize.define('ForgotPassword', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'forgot_password',
    timestamps: false
});

module.exports = ForgotPassword;