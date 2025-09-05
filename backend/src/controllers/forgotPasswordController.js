const User = require('../models/User');
const ForgotPassword = require('../models/forgotPassword');
const brevo = require('../utils/brevoClient');
// const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        const request = await ForgotPassword.create({
            id: uuidv4(),
            userId : user.id,
        })

        const sender = {
            email: "hiteshchandel858@gmail.com",
            name: "Hitesh chandel"
        };

        const receiver = [{ email }];

        await brevo.sendTransacEmail({
            sender,
            to: receiver,
            subject: "Reset Your Password - Expense Tracker",
            textContent: `${user.name},
            We received a request to reset your password.
            Click the link below to reset :
            http://localhost:3000/resetpassword/${request.id}`,
        });

        return res.status(200).json({ message: 'Password reset email sent successfully!' });
    } catch (error) {
        console.error("Sendinblue error:", error);
        return res.status(500).json({ error: "Failed to send reset email" });        
    }
}