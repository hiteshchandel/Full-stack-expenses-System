require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {sequelize }= require('./models/association');
// const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes')
const passwordRoutes = require('./routes/forgotPassword');
const path = require("path");

const app = express();

// app.use(cors());
// app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'expense.html'));
});

app.get('/premium', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'premiumExpense.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/password', passwordRoutes);

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
