import type { Request, Response } from "express";
import { db } from "../prisma/db";

export class EventsController {
    static async getAllEvents(_: Request, res: Response) {
        try {
            const events = await db.orm.public.Event.all();
            return res.status(200).json(events);
        } catch (error) {
            console.error("Error fetching events:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getEventById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (typeof id !== "string" || !id.trim()) {
                return res.status(400).json({ message: "Event not found" });
            }

            const event = await db.orm.public.Event.where({
                id
            }).first();

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            return res.status(200).json(event);
        } catch (error) {
            console.error("Error fetching event:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async createEvent(req: Request, res: Response) {
        try {
            const { title, description, date, venue, totalSeats } = req.body;

            const existingEvent = await db.orm.public.Event.where({
                title,
                date,
                venue
            }).first();

            if (existingEvent) {
                return res.status(400).json({ message: "An event with same name, date, and venue already exists" });
            }

            const newEvent = await db.orm.public.Event.create({
                title,
                description,
                date,
                venue,
                totalSeats
            });

            return res.status(201).json({ message: "Event created successfully", newEvent });
        } catch (error) {
            console.error("Error creating event:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async updateEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, description, date, venue, totalSeats } = req.body;

            if (!id || typeof id !== "string" || !id.trim()) {
                return res.status(400).json({ message: "Event not found" });
            }

            const event = await db.orm.public.Event.where({
                id
            }).first();

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            const bookingCount = await db.orm.public.Booking.where({ eventId: id }).select("id").all();

            if (totalSeats < bookingCount.length) {
                return res.status(400).json({ message: "Total seats cannot be less than the number of bookings" });
            }

            const updatedEvent = await db.orm.public.Event.where({ id }).update({
                title,
                description,
                date,
                venue,
                totalSeats
            });

            return res.status(200).json({ message: "Event updated successfully", updatedEvent });
        } catch (error) {
            console.error("Error updating event:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async deleteEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!id || typeof id !== "string" || !id.trim()) {
                return res.status(400).json({ message: "Event not found" });
            }

            const event = await db.orm.public.Event.where({
                id
            }).first();

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            const bookingCount = await db.orm.public.Booking.where({ eventId: id }).select("id").all();

            if (bookingCount.length === 0) {
                await db.orm.public.Event.where({ id }).delete();
                return res.status(200).json({ message: "Event deleted successfully" });
            }

            const result = await db.orm.public.Event.where({ id }).update({
                isActive: false,
                cancellationReason: reason
            });

            return res.status(200).json({ message: "Event cancelled successfully", result });

        } catch (error) {
            console.error("Error deleting event:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}