import express from "express";
import authRoutes from "./auth.route";
import eventRoutes from "./events.route";
import bookingRoutes from "./booking.route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes)
router.use("/booking", bookingRoutes);

export default router;