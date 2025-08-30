const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/db');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

sequelize.sync()
    .then(() => {
        console.log('Database & tables created!');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((error) => {
        console.error('Error creating database & tables:', error);
    });
