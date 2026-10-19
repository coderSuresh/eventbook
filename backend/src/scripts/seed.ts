import bcrypt from "bcrypt";
import { db } from "../prisma/db.js";

const seedPassword = "EventBook@2026!";

const users = [
    {
        id: "seed-admin-user",
        name: "EventBook Admin",
        email: "admin@eventbook.test",
        role: "ADMIN" as const,
    },
    {
        id: "seed-user-one",
        name: "Suresh Dahal",
        email: "suresh@eventbook.test",
        role: "USER" as const,
    },
    {
        id: "seed-user-two",
        name: "Maya Thapa",
        email: "maya@eventbook.test",
        role: "USER" as const,
    },
];

function eventDate(daysFromToday: number, hour = 18) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
}

const events = [
    {
        id: "seed-event-01",
        title: "Design Systems Workshop",
        description: "A practical workshop on building clear, consistent interfaces that scale.",
        date: eventDate(2, 10),
        venue: "Karkhana Studio",
        totalSeats: 4,
    },
    {
        id: "seed-event-02",
        title: "Kathmandu Product Meetup",
        description: "An evening of product stories, honest lessons, and useful conversations.",
        date: eventDate(4),
        venue: "The Workshop Cafe",
        totalSeats: 3,
    },
    {
        id: "seed-event-03",
        title: "Introduction to TypeScript",
        description: "Learn the foundations of safer, more expressive JavaScript applications.",
        date: eventDate(6, 11),
        venue: "Lalitpur Tech Hub",
        totalSeats: 30,
    },
    {
        id: "seed-event-04",
        title: "Indie Film Night",
        description: "A curated evening of independent short films from South Asian filmmakers.",
        date: eventDate(8, 19),
        venue: "QFX Civil Mall",
        totalSeats: 80,
    },
    {
        id: "seed-event-05",
        title: "Community Run Club",
        description: "A relaxed morning run for all paces, followed by coffee and conversation.",
        date: eventDate(10, 7),
        venue: "Bhrikutimandap Gate",
        totalSeats: 45,
    },
    {
        id: "seed-event-06",
        title: "Photography Walk: Patan",
        description: "Explore historic Patan while learning practical street photography techniques.",
        date: eventDate(12, 8),
        venue: "Patan Durbar Square",
        totalSeats: 20,
    },
    {
        id: "seed-event-07",
        title: "Founder Office Hours",
        description: "Bring your startup questions for a focused afternoon of peer feedback.",
        date: eventDate(14, 14),
        venue: "Impact Hub Kathmandu",
        totalSeats: 12,
    },
    {
        id: "seed-event-08",
        title: "Acoustic Sessions",
        description: "An intimate live music session featuring emerging local artists.",
        date: eventDate(16, 18),
        venue: "Jazz Upstairs",
        totalSeats: 60,
    },
    {
        id: "seed-event-09",
        title: "Coffee Tasting Lab",
        description: "Compare regional beans and learn the basics of tasting and brewing.",
        date: eventDate(18, 10),
        venue: "Beans & Brews",
        totalSeats: 16,
    },
    {
        id: "seed-event-10",
        title: "Accessibility in Practice",
        description: "A hands-on session for making digital products more usable for everyone.",
        date: eventDate(20, 13),
        venue: "Online Event",
        totalSeats: 100,
    },
    {
        id: "seed-event-11",
        title: "Open Source Contributors Night",
        description: "Meet local maintainers and find a friendly first issue to work on.",
        date: eventDate(22, 17),
        venue: "Deerwalk Complex",
        totalSeats: 40,
    },
    {
        id: "seed-event-12",
        title: "Weekend Pottery Class",
        description: "Make something with your hands in a beginner-friendly studio session.",
        date: eventDate(24, 10),
        venue: "Clay Station",
        totalSeats: 14,
    },
    {
        id: "seed-event-past",
        title: "Past Community Demo Day",
        description: "A completed demo day fixture for testing past-event booking restrictions.",
        date: eventDate(-7, 15),
        venue: "Tinkune Hall",
        totalSeats: 25,
    },
];

const bookings = [
    {
        id: "seed-booking-nearly-admin",
        eventId: "seed-event-01",
        userId: "seed-admin-user",
        status: "CONFIRMED" as const,
    },
    {
        id: "seed-booking-nearly-suresh",
        eventId: "seed-event-01",
        userId: "seed-user-one",
        status: "CONFIRMED" as const,
    },
    {
        id: "seed-booking-nearly-maya",
        eventId: "seed-event-01",
        userId: "seed-user-two",
        status: "CONFIRMED" as const,
    },
    {
        id: "seed-booking-full-admin",
        eventId: "seed-event-02",
        userId: "seed-admin-user",
        status: "CONFIRMED" as const,
    },
    {
        id: "seed-booking-full-suresh",
        eventId: "seed-event-02",
        userId: "seed-user-one",
        status: "CONFIRMED" as const,
    },
    {
        id: "seed-booking-full-maya",
        eventId: "seed-event-02",
        userId: "seed-user-two",
        status: "CONFIRMED" as const,
    },
];

async function main() {
    const password = await bcrypt.hash(seedPassword, 10);

    await db.transaction(async (tx) => {
        for (const user of users) {
            await tx.orm.public.User.where({ email: user.email }).upsert({
                create: {
                    ...user,
                    password,
                    isActive: true,
                    isVerified: true,
                    token: null,
                    refreshTokenHash: null,
                },
                update: {
                    name: user.name,
                    password,
                    role: user.role,
                    isActive: true,
                    isVerified: true,
                    token: null,
                    refreshTokenHash: null,
                },
            });
        }

        for (const event of events) {
            await tx.orm.public.Event.where({ id: event.id }).upsert({
                create: {
                    ...event,
                    isActive: true,
                    cancellationReason: null,
                },
                update: {
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    venue: event.venue,
                    totalSeats: event.totalSeats,
                    isActive: true,
                    cancellationReason: null,
                },
            });
        }

        for (const booking of bookings) {
            await tx.orm.public.Booking.where({ id: booking.id }).upsert({
                create: booking,
                update: {
                    eventId: booking.eventId,
                    userId: booking.userId,
                    status: booking.status,
                },
            });
        }
    });

    console.log(`Seeded ${users.length} users, ${events.length} events, and ${bookings.length} bookings.`);
    console.log(`Seed password for all accounts: ${seedPassword}`);
}

main()
    .catch((error: unknown) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.close();
    });
