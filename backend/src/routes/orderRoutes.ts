import express from "express";
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, confirmOrder } from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, createOrder);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);
router.post("/:id/confirm", protect, confirmOrder);

export default router;
