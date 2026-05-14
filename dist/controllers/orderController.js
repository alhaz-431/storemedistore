"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getSingleOrder = exports.getAllOrders = exports.getMyOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ ১. Create Order (অর্ডার তৈরি করা)
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, shippingName, shippingPhone } = req.body;
        const customerId = req.user?.userId;
        if (!customerId) {
            return res.status(401).json({ error: "ইউজার আইডি পাওয়া যায়নি" });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "কার্ট খালি, অর্ডার করা সম্ভব নয়" });
        }
        if (!shippingAddress || !shippingName || !shippingPhone) {
            return res.status(400).json({ error: "নাম, ফোন নম্বর এবং ঠিকানা আবশ্যক" });
        }
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const medicine = await prisma.medicine.findUnique({
                where: { id: item.medicineId },
            });
            if (!medicine) {
                return res.status(404).json({ error: `মেডিসিন পাওয়া যায়নি: ${item.medicineId}` });
            }
            if (medicine.stock < item.quantity) {
                return res.status(400).json({
                    error: `${medicine.name} এর পর্যাপ্ত স্টক নেই। আছে: ${medicine.stock}`
                });
            }
            totalAmount += medicine.price * item.quantity;
            orderItems.push({
                medicineId: item.medicineId,
                quantity: item.quantity,
                price: medicine.price,
            });
        }
        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}`,
                customerId,
                totalAmount,
                shippingAddress,
                shippingName,
                shippingPhone,
                items: {
                    createMany: {
                        data: orderItems,
                    },
                },
            },
            include: {
                items: true,
            },
        });
        for (const item of items) {
            await prisma.medicine.update({
                where: { id: item.medicineId },
                data: { stock: { decrement: item.quantity } },
            });
        }
        res.status(201).json({ success: true, message: "অর্ডার সফল হয়েছে!", data: order });
    }
    catch (error) {
        console.error("❌ Order Error:", error);
        res.status(500).json({ error: "অর্ডার করা যায়নি", details: error.message });
    }
};
exports.createOrder = createOrder;
// ✅ ২. Get My Orders (কাস্টমারের নিজের অর্ডার দেখা)
const getMyOrders = async (req, res) => {
    try {
        const customerId = req.user?.userId;
        const orders = await prisma.order.findMany({
            where: { customerId },
            include: {
                items: { include: { medicine: true } }
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "অর্ডার লিস্ট লোড হয়নি" });
    }
};
exports.getMyOrders = getMyOrders;
// ✅ ৩. Get All Orders (অ্যাডমিন ও সেলারের জন্য সব অর্ডার দেখা)
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: { include: { medicine: true } },
                // এখানে 'customer' বা 'user' আপনার স্কিমা অনুযায়ী চেক করুন
                customer: {
                    select: { name: true, email: true, image: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    }
    catch (error) {
        console.error("❌ Get All Orders Error:", error);
        res.status(500).json({ error: "সব অর্ডার লোড করা যায়নি" });
    }
};
exports.getAllOrders = getAllOrders;
// ✅ ৪. Get Single Order (একটি নির্দিষ্ট অর্ডার দেখা)
const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: { medicine: true }
                },
                customer: { select: { name: true, email: true, image: true } }
            },
        });
        if (!order) {
            return res.status(404).json({ error: "অর্ডার খুঁজে পাওয়া যায়নি" });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: "অর্ডার ডিটেইলস লোড করা যায়নি" });
    }
};
exports.getSingleOrder = getSingleOrder;
// ✅ ৫. Update Order Status (স্ট্যাটাস পরিবর্তনের ফাংশন)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
        });
        res.status(200).json({
            success: true,
            message: `অর্ডার স্ট্যাটাস সফলভাবে ${status} করা হয়েছে`,
            data: updatedOrder
        });
    }
    catch (error) {
        console.error("❌ Update Status Error:", error);
        res.status(500).json({ error: "স্ট্যাটাস আপডেট করা যায়নি" });
    }
};
exports.updateOrderStatus = updateOrderStatus;
