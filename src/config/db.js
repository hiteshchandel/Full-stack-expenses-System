const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
//     host: 'localhost',
//     dialect: 'mysql'
// });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = sequelize;