import express from "express";
import authRoutes from "./auth.route";
import eventRoutes from "./events.route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes)

export default router;