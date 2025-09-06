const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

cashfree.XApiVersion = "2022-09-01";

exports.createOrder = async (
    order_amount,
    order_id,
    customer_id,
    customer_name,
    customer_email,
    customer_phone
) => {
    try {
        const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const request = {
            order_amount,
            order_currency: "INR",
            order_id,
            customer_details: {
                customer_id,
                customer_name,
                customer_email,
                customer_phone
            },
            order_meta: {
                return_url: `http://localhost:3000/expenses`,
                notify_url: "http://localhost:3000/payment/notify",
                payment_methods: "cc,dc,upi"
            },
            order_expiry_time: expiry
        };

        const response = await cashfree.PGCreateOrder(request);
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error.response?.data || error);
        throw error;
    }
};

exports.getPaymentStatus = async (order_id) => {
    try {
        const response = await cashfree.PGFetchOrder(order_id);
        const { order_status } = response.data;

        if (order_status === "PAID") return "SUCCESS";
        if (order_status === "PENDING") return "PENDING";
        return "FAILED";
    } catch (error) {
        console.error("Error fetching payment status:", error.response?.data || error);
        throw error;
    }
};
