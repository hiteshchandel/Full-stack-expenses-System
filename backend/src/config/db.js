const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('expenses', 'root', '@khatik360', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = sequelize;