const path = require("path");
const bcrypt = require("bcryptjs"); 
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const ForgotPassword = require("../models/forgotPassword");
const brevo = require("../utils/brevoClient");

//send forgot password link
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const request = await ForgotPassword.create({
            id: uuidv4(),
            userId: user.id,
        });

        const resetLink = `http://localhost:3000/api/password/resetpassword/${request.id}`

        await brevo.sendTransacEmail({
        sender: {
            email: "hiteshchandel858@gmail.com",
            name: "Hitesh Chandel",
        },
        to: [{ email }],
        subject: "Reset Your Password - Expense Tracker",
        textContent: `${user.name},
            We received a request to reset your password.
            Click the link below to reset your password: ${resetLink}`,
        });

        return res.status(200).json({ message: "Password reset email sent successfully!" });
    } catch (error) {
        console.error("Sendinblue error:", error);
        return res.status(500).json({ error: "Failed to send reset email" });
    }
};

// send form in email
exports.resetPasswordForm = async (req, res) => {
    const { uuid } = req.params;
    const request = await ForgotPassword.findOne({
        where: { id: uuid, isActive: true },
    });

    if (!request) {
        return res.send("Invalid or expired link");
    }

    res.sendFile(path.join(__dirname, "../views", "updatePassword.html"));
};

// Update password
exports.updatePassword = async (req, res) => {
    const { uuid } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is missing!" });
    }

    const request = await ForgotPassword.findOne({
        where: { id: uuid, isActive: true },
    });

    if (!request) {
        return res.status(400).json({ message: "Invalid or expired link" });
    }

    const hashedPassword = await bcrypt.hash(password, bcrypt.genSaltSync(10));
    await User.update({ password: hashedPassword }, { where: { id: request.userId } });

    request.isActive = false;
    await request.save();

    res.json({ message: "Password updated successfully" });
};
