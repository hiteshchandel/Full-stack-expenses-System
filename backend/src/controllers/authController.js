const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already Registered" });
        }

        const hashedPassword = await bcrypt.hash(password, bcrypt.genSaltSync(10));
        const newUser = await User.create({ name, email, password: hashedPassword, mobile });
        return res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}