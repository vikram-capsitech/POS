import express from "express";
import { getHomeDetails, getBadges } from "../controllers/homeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",       protect, getHomeDetails);
router.get("/badges", protect, getBadges);

export default router;