const User = require('../models/User');

exports.getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });

    } catch (error) {
        console.error("❌ Error fetching user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.getAllUserTotalExpenseIfIsPremium = async (req, res) => {
    try {
        // Only fetch users who are premium and order by totalExpense
        const users = await User.findAll({
            attributes: ["id", "name", "totalExpense"],
            // where: { isPremium: true },
            order: [["totalExpense", "DESC"]]
        });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.log("❌ Error fetching user expenses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
