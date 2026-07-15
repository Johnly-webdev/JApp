import { Router } from "express";
import {
  getMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/:conversationId", getMessages);
router.post("/", sendMessage);
router.delete("/:id", deleteMessage);

export default router;
