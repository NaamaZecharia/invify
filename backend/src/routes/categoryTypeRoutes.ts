import express from "express";
import { getCategoryTypes, createCategoryType } from "../controllers/categoryTypeController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getCategoryTypes);
router.post("/", protect, createCategoryType);

export default router;
