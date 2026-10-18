import express from "express";
import authRoutes from "./auth.route.js";
import eventRoutes from "./events.route.js";
import bookingRoutes from "./booking.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes)
router.use("/booking", bookingRoutes);

export default router;