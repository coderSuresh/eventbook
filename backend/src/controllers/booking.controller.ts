import type { Request, Response } from "express";
import { db } from "../prisma/db";
import type { AuthenticatedRequest } from "../types";

export class BookingController {
    static async getBookingsByEventId(req: Request, res: Response) {
        try {
            const { eventId } = req.params;

            if (!eventId || typeof eventId !== "string" || !eventId.trim()) {
                return res.status(400).json({ message: "Event not found" });
            }

            const bookings = await db.orm.public.Booking.where({
                eventId
            }).all();

            return res.status(200).json({ bookings });
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getBookingsByUserId(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(400).json({ message: "User not found" });
            }

            const bookings = await db.orm.public.Booking.where({
                userId
            }).all();

            return res.status(200).json({ bookings });
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async createBooking(req: AuthenticatedRequest, res: Response) {
        try {
            const { eventId } = req.body;

            if (typeof eventId !== "string" || !eventId.trim()) {
                return res.status(400).json({ message: "Invalid event ID" });
            }

            const userId = req.user?.userId!;

            const result = await db.transaction(async (tx) => {
                const lockedEvents = await tx.query(
                    tx.sql.public.Event
                        .select("id")
                        .where((f, fns) => fns.eq(f.id, eventId))
                        .forUpdate()
                        .build()
                );

                if (lockedEvents.length === 0) {
                    return {
                        status: 404,
                        body: { message: "Event not found" }
                    };
                }

                const event = await tx.orm.public.Event
                    .where({ id: eventId })
                    .first();

                if (!event || !event.isActive || new Date(event.date).getTime() < Date.now()) {
                    return {
                        status: 404,
                        body: { message: "Event not found" }
                    };
                }

                const existingBooking = await tx.orm.public.Booking
                    .where({ eventId, userId })
                    .first();

                if (existingBooking?.status === "CONFIRMED") {
                    return {
                        status: 200,
                        body: { booking: existingBooking }
                    };
                }

                const confirmedBookings = await tx.orm.public.Booking
                    .where({
                        eventId,
                        status: "CONFIRMED"
                    })
                    .select("id")
                    .all();

                if (confirmedBookings.length >= event.totalSeats) {
                    return {
                        status: 409,
                        body: {
                            message: "No available seats for this event"
                        }
                    };
                }

                const booking = existingBooking
                    ? await tx.orm.public.Booking
                        .where({ id: existingBooking.id })
                        .update({ status: "CONFIRMED" })
                    : await tx.orm.public.Booking.create({
                        eventId,
                        userId
                    });

                return {
                    status: existingBooking ? 200 : 201,
                    body: { booking }
                };
            });

            return res.status(result.status).json(result.body);
        } catch (error: any) {
            if (error?.sqlState === "23505" || error?.code === "23505") {
                return res.status(409).json({ message: "You already have a booking for this event" });
            }

            console.error("Error creating booking:", error);

            return res.status(500).json({ message: "Internal server error" });
        }
    }



    static async cancelBooking(req: AuthenticatedRequest, res: Response) {
        try {
            const { bookingId } = req.params as { bookingId: string };
            const userId = req.user?.userId!;

            if (!bookingId?.trim()) {
                return res.status(400).json({ message: "Invalid booking ID" });
            }

            const result = await db.transaction(async (tx) => {
                const booking = await tx.orm.public.Booking
                    .where({ id: bookingId, userId })
                    .first();

                if (!booking || booking.status !== "CONFIRMED") {
                    return {
                        status: 404,
                        body: {
                            message: "Booking not found or already cancelled"
                        }
                    };
                }

                const lockedEvents = await tx.query(
                    tx.sql.public.Event
                        .select("id")
                        .where((f, fns) => fns.eq(f.id, booking.eventId))
                        .forUpdate()
                        .build()
                );

                if (lockedEvents.length === 0) {
                    return {
                        status: 404,
                        body: { message: "Event not found" }
                    };
                }

                const currentBooking = await tx.orm.public.Booking
                    .where({ id: bookingId, userId })
                    .first();

                if (!currentBooking || currentBooking.status !== "CONFIRMED") {
                    return {
                        status: 404,
                        body: {
                            message: "Booking not found or already cancelled"
                        }
                    };
                }

                const event = await tx.orm.public.Event
                    .where({ id: currentBooking.eventId })
                    .first();

                if (!event) {
                    return {
                        status: 404,
                        body: { message: "Event not found" }
                    };
                }

                if (new Date(event.date).getTime() < Date.now()) {
                    return {
                        status: 400,
                        body: {
                            message: "Booking for past event cannot be cancelled"
                        }
                    };
                }

                await tx.orm.public.Booking
                    .where({
                        id: bookingId,
                        userId,
                        status: "CONFIRMED"
                    })
                    .update({ status: "CANCELLED" });

                return {
                    status: 200,
                    body: {
                        message: "Booking cancelled successfully"
                    }
                };
            });

            return res.status(result.status).json(result.body);
        } catch (error) {
            console.error("Error cancelling booking:", error);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
}