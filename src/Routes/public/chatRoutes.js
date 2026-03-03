import express from "express";
import { handleChat } from "../../Controller/public/chatController.js";

const router = express.Router();

router.post("/", handleChat);

export default router;
