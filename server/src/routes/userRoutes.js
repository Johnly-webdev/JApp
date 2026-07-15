import { Router } from "express";
import { searchUsers, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/search", searchUsers);
router.patch("/me", updateProfile);

export default router;
