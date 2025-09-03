const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

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
        console.log(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "User not authorized" });
        }
        const token = generateToken(user);
        return res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};