import type { Request, Response } from "express";
import { db } from "../prisma/db.js";

export class EventsController {
    static async getAllEvents(req: Request, res: Response) {
        try {
            const requestedPage = Number(req.query["page"] ?? 1);
            const requestedPageSize = Number(req.query["pageSize"] ?? 10);
            const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
            const pageSize = Number.isInteger(requestedPageSize) && requestedPageSize > 0
                ? Math.min(requestedPageSize, 50)
                : 10;
            const offset = (page - 1) * pageSize;
            const eventsQuery = db.orm.public.Event;
            const { count: total } = await eventsQuery.aggregate((aggregate) => ({
                count: aggregate.count(),
            }));
            const events = await eventsQuery
                .orderBy((event) => event.date.asc())
                .limit(pageSize)
                .offset(offset)
                .all();
            const totalPages = Math.ceil(total / pageSize);

            return res.status(200).json({
                data: events,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            });
        } catch (error) {
            console.error("Error fetching events:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getUpcomingEvents(req: Request, res: Response) {
        try {
            const requestedPage = Number(req.query["page"] ?? 1);
            const requestedPageSize = Number(req.query["pageSize"] ?? 10);
            const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

            const pageSize = Number.isInteger(requestedPageSize) && requestedPageSize > 0
                ? Math.min(requestedPageSize, 50)
                : 10;

            const offset = (page - 1) * pageSize;

            const upcomingEventsQuery = db.orm.public.Event
                .where(q => q.date.gte(new Date().toISOString()))
                .where({ isActive: true });

            const { count: total } = await upcomingEventsQuery.aggregate((aggregate) => ({
                count: aggregate.count(),
            }));

            const upcomingEvents = await upcomingEventsQuery
                .orderBy((event) => event.date.asc())
                .limit(pageSize)
                .offset(offset)
                .all();

            const eventsWithAvailability = await Promise.all(upcomingEvents.map(async (event) => {
                const confirmedBookings = await db.orm.public.Booking.where({
                    eventId: event.id,
                    status: "CONFIRMED",
                }).all();

                return {
                    ...event,
                    remainingSeats: Math.max(event.totalSeats - confirmedBookings.length, 0),
                };
            }));

            const totalPages = Math.ceil(total / pageSize);

            return res.status(200).json({
                data: eventsWithAvailability,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            });
        } catch (error) {
            console.error("Error fetching upcoming events:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async searchEvents(req: Request, res: Response) {
        try {
            const { query } = req.query;

            if (!query || typeof query !== "string" || !query.trim()) {
                return res.status(400).json({ message: "Invalid search query" });
            }

            console.log(`%${query}%`);

            const events = await db.orm.public.Event
                .where({ isActive: true })
                .where(q => q.title.ilike(`%${query}%`))
                .all();

            return res.status(200).json(events);
        } catch (error) {
            console.error("Error searching events:", error);
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