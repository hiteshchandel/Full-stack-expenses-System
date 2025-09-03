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
