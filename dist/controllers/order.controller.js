"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.cancelOrder = exports.getSingleOrder = exports.getUserOrders = exports.getAllOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * 📦 CREATE ORDER (CUSTOMER)
 * Route: POST /api/v1/orders
 * Access: Private (Customer Only)
 */
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingName, shippingPhone, shippingAddress } = req.body;
        const customerId = req.user?.id || req.user?.userId;
        if (!customerId) {
            res.status(401).json({ success: false, message: "ইউজার অথেনটিকেশন ব্যর্থ হয়েছে! আবার লগইন করুন।" });
            return;
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ success: false, message: "কার্ট খালি! কোনো প্রোডাক্ট পাওয়া যায়নি।" });
            return;
        }
        const result = await prisma.$transaction(async (tx) => {
            const orderItemsData = [];
            // 🎯 কার্টের প্রতিটা ঔষধের জন্য লুপ চলছে (৩টা হোক বা ৫টা, সব আইটেম প্রসেস হবে)
            for (const item of items) {
                const medicine = await tx.medicine.findUnique({
                    where: { id: item.medicineId || item.id },
                    select: { id: true, sellerId: true, stock: true, name: true }
                });
                if (!medicine) {
                    throw new Error(`ঔষধটি পাওয়া যায়নি`);
                }
                if (medicine.stock < Number(item.quantity)) {
                    throw new Error(`দুঃখিত, '${medicine.name}' পর্যাপ্ত স্টক নেই।`);
                }
                // স্টক কমানো হচ্ছে
                await tx.medicine.update({
                    where: { id: medicine.id },
                    data: { stock: { decrement: Math.max(1, Number(item.quantity)) } }
                });
                orderItemsData.push({
                    medicineId: medicine.id,
                    quantity: Math.max(1, Number(item.quantity)),
                    price: Number(item.price),
                    sellerId: medicine.sellerId
                });
            }
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    totalAmount: Number(totalAmount),
                    shippingName: (shippingName || "Customer").trim(),
                    shippingPhone: (shippingPhone || "").trim(),
                    shippingAddress: (shippingAddress || "").trim(),
                    status: "PENDING",
                    customerId: customerId,
                    items: {
                        create: orderItemsData
                    }
                },
                include: {
                    items: true
                }
            });
            return newOrder;
        });
        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: result
        });
    }
    catch (error) {
        console.error("❌ Create Order Error:", error);
        res.status(400).json({ success: false, message: error.message || "অর্ডার প্রসেস করার সময় সমস্যা হয়েছে।" });
    }
};
exports.createOrder = createOrder;
/**
 * 👑 GET ORDERS WITH MULTI-ROLE FILTERING (CUSTOMER / SELLER / ADMIN)
 * Route: GET /api/v1/orders
 */
const getAllOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const role = req.user?.role;
        if (!userId) {
            res.status(401).json({ success: false, message: "ইউজার আইডি পাওয়া যায়নি! আবার লগইন করুন।" });
            return;
        }
        let queryCondition = {};
        // 🎯 ১. কাস্টমার হলে শুধু তার নিজস্ব অর্ডারগুলো দেখাবে (CANCELLED সহ সব থাকবে)
        if (role === "CUSTOMER") {
            queryCondition = { customerId: userId };
        }
        // 🎯 ২. সেলার হলে শুধু তার ওয়ানড প্রোডাক্টের অর্ডার দেখবে
        else if (role === "SELLER") {
            queryCondition = {
                items: {
                    some: {
                        sellerId: userId
                    }
                }
            };
        }
        // 🎯 ৩. ADMIN হলে queryCondition একদম ফাঁকা {} থাকবে, ফলে সব কাস্টমারের সব অর্ডার অ্যাডমিন দেখতে পাবে।
        const orders = await prisma.order.findMany({
            where: queryCondition,
            include: {
                items: {
                    include: {
                        medicine: true // 🎯 প্রতিটা অর্ডারের ভেতরের সব ঔষধের ডিটেইলস একসাথে তুলে আনা হচ্ছে
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("❌ Get All Orders Error:", error);
        res.status(500).json({ success: false, message: error.message || "অর্ডার হিস্ট্রি লোড করতে সমস্যা হয়েছে।" });
    }
};
exports.getAllOrders = getAllOrders;
/**
 * 📦 GET USER ORDERS (BACKWARD COMPATIBILITY)
 */
const getUserOrders = async (req, res) => {
    return (0, exports.getAllOrders)(req, res);
};
exports.getUserOrders = getUserOrders;
/**
 * 🔍 GET SINGLE ORDER WITH SECURITY CHECK (VIEW DETAILS)
 */
const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?.userId;
        const role = req.user?.role;
        if (!userId) {
            res.status(401).json({ success: false, message: "ইউজার অথেনটিকেশন ব্যর্থ হয়েছে!" });
            return;
        }
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        medicine: true
                    }
                }
            }
        });
        if (!order) {
            res.status(404).json({ success: false, message: "অর্ডার পাওয়া যায়নি" });
            return;
        }
        if (role === "CUSTOMER" && order.customerId !== userId) {
            res.status(403).json({ success: false, message: "আপনার এই অর্ডারের ডিটেইলস দেখার অনুমতি নেই!" });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSingleOrder = getSingleOrder;
/**
 * ❌ CANCEL ORDER (CUSTOMER)
 */
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user?.id || req.user?.userId;
        if (!customerId) {
            res.status(401).json({ success: false, message: "ইউজার অথেনটিকেশন ব্যর্থ হয়েছে!" });
            return;
        }
        const order = await prisma.order.findUnique({
            where: { id: id },
            include: { items: true }
        });
        if (!order) {
            res.status(404).json({ success: false, message: "অর্ডারটি খুঁজে পাওয়া যায়নি!" });
            return;
        }
        if (order.customerId !== customerId) {
            res.status(403).json({ success: false, message: "আপনার এই অর্ডারটি বাতিল করার অনুমতি নেই!" });
            return;
        }
        if (order.status === "CANCELLED") {
            res.status(400).json({ success: false, message: "অর্ডারটি ইতিমধ্যে বাতিল করা হয়েছে।" });
            return;
        }
        if (order.status === "SHIPPED" || order.status === "DELIVERED") {
            res.status(400).json({ success: false, message: "দুঃখিত, অর্ডারটি ইতিমধ্যে শিপড বা ডেলিভারি হয়ে গেছে!" });
            return;
        }
        const cancelledOrder = await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: { stock: { increment: item.quantity } }
                });
            }
            const updatedOrder = await tx.order.update({
                where: { id: id },
                data: { status: "CANCELLED" }
            });
            return updatedOrder;
        });
        res.status(200).json({
            success: true,
            message: "অর্ডারটি সফলভাবে বাতিল করা হয়েছে এবং স্টক রিফান্ড করা হয়েছে!",
            order: cancelledOrder
        });
    }
    catch (error) {
        console.error("❌ Cancel Order Error:", error);
        res.status(500).json({ success: false, message: error.message || "সার্ভার সমস্যা।" });
    }
};
exports.cancelOrder = cancelOrder;
/**
 * 👑 UPDATE ORDER STATUS (ADMIN ONLY)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ success: true, message: "অর্ডারের স্ট্যাটাস আপডেট হয়েছে", data: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
