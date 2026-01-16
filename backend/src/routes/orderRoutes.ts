import express from "express";
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder,} from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, createOrder);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

export default router;
