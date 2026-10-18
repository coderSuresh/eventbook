import express from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { validateBody } from "../middlewares/validate-body.middleware.js";
import { createBookingSchema } from "../zod-schemas/booking.schema.js";
import { authenticateJwt, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

const { getBookingsByEventId, getBookingsByUserId, createBooking, cancelBooking } = BookingController;

router.get("/user", authenticateJwt, authorizeRoles("USER", "ADMIN"), getBookingsByUserId);
router.get("/event/:eventId", authenticateJwt, authorizeRoles("ADMIN"), getBookingsByEventId);
router.post("/", authenticateJwt, validateBody(createBookingSchema), authorizeRoles("USER", "ADMIN"), createBooking);
router.delete("/:bookingId", authenticateJwt, authorizeRoles("USER", "ADMIN"), cancelBooking);

export default router;