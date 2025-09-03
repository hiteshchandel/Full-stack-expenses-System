require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {sequelize }= require('./models/association');
// const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/payments', paymentRoutes);

sequelize.sync({alter:true})
    .then(() => {
        console.log('Database & tables created!');
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error creating database & tables:', error);
    });
