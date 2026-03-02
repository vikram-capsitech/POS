import express from "express";
import { protect } from "../../Middlewares/Auth.middleware.js";
import {
  getHomeDetails,
  getBadges,
} from "../../Controller/Core/homeController.js";

const router = express.Router();

router.get("/", protect, getHomeDetails);
router.get("/badges", protect, getBadges);

export default router;
