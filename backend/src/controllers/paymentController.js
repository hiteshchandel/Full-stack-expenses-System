const Payment = require('../models/Payment');
const User = require('../models/User');
const { createOrder, getPaymentStatus } = require('../services/cashfreeService');


exports.createPayment = async (req, res) => {
    const order_amount = "999";
    const order_id = "order_" + Date.now();
    const customer_id = String(req.user.id);
    const customer_phone = req.user.mobile;
    const customer_name = req.user.name;
    const customer_email = req.user.email;

    try {
        const response = await createOrder(
            order_amount,
            order_id,
            customer_id,
            customer_name,
            customer_email,
            customer_phone
        );
        const paymentSessionId = response.payment_session_id;

        await Payment.create({
            orderId: order_id,
            paymentSessionId,
            amount: order_amount,
            orderCurrency: "INR",
            paymentStatus: "PENDING"
        });
        res.status(201).json({ paymentSessionId, order_id });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    const { orderId } = req.params;

    try {
        const status = await getPaymentStatus(orderId);
        await Payment.update(
            { paymentStatus: status },
            { where: { orderId } }
        );
        if (status === "SUCCESS") {
            const user = await User.findOne({
                where: { id: req.user.id }
            });
            user.isPremium = true;
            await user.save();
        }
        return res.status(200).json({ message: "Payment status updated", status });
    } catch (error) {
        console.error("Error updating payment status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};