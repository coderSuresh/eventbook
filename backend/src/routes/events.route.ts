import express from "express";
import { EventsController } from "../controllers/events.controller.js";
import { validateBody } from "../middlewares/validate-body.middleware.js";
import { createEventSchema, deleteEventSchema } from "../zod-schemas/event.schema.js";
import { authenticateJwt, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

const { getAllEvents, getUpcomingEvents, searchEvents, getEventById, createEvent, updateEvent, deleteEvent } = EventsController;

router.get("/", getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/search", searchEvents);
router.get("/:id", getEventById);

router.post("/", authenticateJwt, authorizeRoles("ADMIN"), validateBody(createEventSchema), createEvent);
router.put("/:id", authenticateJwt, authorizeRoles("ADMIN"), validateBody(createEventSchema), updateEvent);
router.delete("/:id", authenticateJwt, authorizeRoles("ADMIN"), validateBody(deleteEventSchema), deleteEvent);

export default router;