const express = require("express");
const { getHomeDetails ,getBadges} = require("../controllers/homeController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, getHomeDetails);
router.get("/badges",protect,getBadges);

module.exports = router;
