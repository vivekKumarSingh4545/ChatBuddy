import express from "express";
import authRouter from "./auth.route.js";
import ConversationRoutes from "./conversation.route.js";
import userRoutes from "./user.route.js";
import MessageRoutes from "./message.route.js";

const router = express.Router();

router.use("/auth",authRouter);
router.use("/user", userRoutes);
router.use("/conversation", ConversationRoutes);
router.use("/message", MessageRoutes);

export default router;