import express from "express";
import { EventsController } from "../controllers/events.controller";
import { validateBody } from "../middlewares/validate-body.middleware";
import { createEventSchema, deleteEventSchema } from "../zod-schemas/event.schema";
import { authenticateJwt, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = EventsController;

router.get("/", getAllEvents);
router.get("/:id", getEventById);

router.post("/", authenticateJwt, authorizeRoles("ADMIN"), validateBody(createEventSchema), createEvent);
router.put("/:id", authenticateJwt, authorizeRoles("ADMIN"), validateBody(createEventSchema), updateEvent);
router.delete("/:id", authenticateJwt, authorizeRoles("ADMIN"), validateBody(deleteEventSchema), deleteEvent);

export default router;