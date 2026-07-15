import { Router } from "express";
import {
  getConversations,
  startConversation,
  createGroup,
} from "../controllers/conversationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getConversations);
router.post("/", startConversation);
router.post("/group", createGroup);

export default router;
