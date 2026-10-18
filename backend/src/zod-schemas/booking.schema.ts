import { z } from "zod";

const createBookingSchema = z.object({
    eventId: z.string().min(1, "Event ID is required"),
});

export { createBookingSchema };