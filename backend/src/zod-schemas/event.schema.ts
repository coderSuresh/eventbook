import { z } from "zod";

const createEventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    date: z.string().min(1, "Date is required"),
    venue: z.string().min(1, "Venue is required"),
    totalSeats: z.number().int().positive("Total seats must be a positive integer"),
});

const deleteEventSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
});

export { createEventSchema, deleteEventSchema };