const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    paymentSessionId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    orderCurrency: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    }
}, {
    tableName: 'payments',
    timestamps: true
})

module.exports = Payment;