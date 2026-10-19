import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, before, test } from "node:test";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";

process.env["NODE_ENV"] = "test";
process.env["JWT_SECRET"] ??= "eventbook-test-secret";

if (!process.env["TEST_DATABASE_URL"]) {
    throw new Error("TEST_DATABASE_URL must point to an isolated test database");
}

process.env["DATABASE_URL"] = process.env["TEST_DATABASE_URL"];

const { app } = await import("../src/index.js");
const { db } = await import("../src/prisma/db.js");

type Role = "USER" | "ADMIN";
type FixtureUser = { id: string; email: string; role: Role };
type FixtureEvent = { id: string };

type RequestOptions = {
    method?: string;
    token?: string;
    body?: unknown;
};

let server: ReturnType<typeof app.listen>;
let baseUrl = "";
const fixtureBookings: string[] = [];
const fixtureEvents: string[] = [];
const fixtureUsers: string[] = [];

before(async () => {
    server = app.listen(0);
    await once(server, "listening");
    const address = server.address();

    if (!address || typeof address === "string") {
        throw new Error("Test server did not expose a TCP address");
    }

    baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
});

after(async () => {
    await db.close();
    server.close();
});

afterEach(async () => {
    for (const id of fixtureBookings.splice(0)) {
        await db.orm.public.Booking.where({ id }).delete();
    }

    for (const id of fixtureEvents.splice(0)) {
        await db.orm.public.Event.where({ id }).delete();
    }

    for (const id of fixtureUsers.splice(0)) {
        await db.orm.public.User.where({ id }).delete();
    }
});

async function request(path: string, options: RequestOptions = {}) {
    const headers = new Headers({ "Content-Type": "application/json" });

    if (options.token) {
        headers.set("Authorization", `Bearer ${options.token}`);
    }

    return fetch(`${baseUrl}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
}

function tokenFor(user: FixtureUser) {
    return jwt.sign(
        { userId: user.id, role: user.role, type: "access" },
        process.env["JWT_SECRET"]!,
        { expiresIn: "1h" },
    );
}

async function createUser(role: Role = "USER") {
    const id = `test-user-${crypto.randomUUID()}`;
    const email = `${id}@eventbook.test`;

    await db.orm.public.User.create({
        id,
        name: `Test ${role}`,
        email,
        password: "not-used-by-route-tests",
        role,
        isActive: true,
        isVerified: true,
        token: null,
        refreshTokenHash: null,
    });

    fixtureUsers.push(id);
    return { id, email, role } satisfies FixtureUser;
}

async function createEvent(totalSeats: number) {
    const id = `test-event-${crypto.randomUUID()}`;

    await db.orm.public.Event.create({
        id,
        title: `Test event ${id}`,
        description: "An event created by the backend integration tests.",
        date: new Date(Date.now() + 86_400_000).toISOString(),
        venue: "Test venue",
        totalSeats,
        isActive: true,
        cancellationReason: null,
    });

    fixtureEvents.push(id);
    return { id } satisfies FixtureEvent;
}

test("booking a full event returns 409 and duplicate booking is idempotent", async () => {
    const firstUser = await createUser();
    const secondUser = await createUser();
    const event = await createEvent(1);

    const firstBooking = await request("/booking", {
        method: "POST",
        token: tokenFor(firstUser),
        body: { eventId: event.id },
    });
    assert.equal(firstBooking.status, 201);
    const firstBookingBody = await firstBooking.json() as { booking: { id: string } };
    fixtureBookings.push(firstBookingBody.booking.id);

    const duplicateBooking = await request("/booking", {
        method: "POST",
        token: tokenFor(firstUser),
        body: { eventId: event.id },
    });
    assert.equal(duplicateBooking.status, 200);

    const fullEventBooking = await request("/booking", {
        method: "POST",
        token: tokenFor(secondUser),
        body: { eventId: event.id },
    });
    assert.equal(fullEventBooking.status, 409);
});

test("cancelling a booking is owner-only and frees the seat", async () => {
    const owner = await createUser();
    const otherUser = await createUser();
    const event = await createEvent(1);

    const bookingResponse = await request("/booking", {
        method: "POST",
        token: tokenFor(owner),
        body: { eventId: event.id },
    });
    const bookingBody = await bookingResponse.json() as { booking: { id: string } };
    fixtureBookings.push(bookingBody.booking.id);

    const foreignCancellation = await request(`/booking/${bookingBody.booking.id}`, {
        method: "DELETE",
        token: tokenFor(otherUser),
    });
    assert.equal(foreignCancellation.status, 404);

    const cancellation = await request(`/booking/${bookingBody.booking.id}`, {
        method: "DELETE",
        token: tokenFor(owner),
    });
    assert.equal(cancellation.status, 200);

    const repeatedCancellation = await request(`/booking/${bookingBody.booking.id}`, {
        method: "DELETE",
        token: tokenFor(owner),
    });
    assert.equal(repeatedCancellation.status, 404);

    const restoredBooking = await request("/booking", {
        method: "POST",
        token: tokenFor(otherUser),
        body: { eventId: event.id },
    });
    assert.equal(restoredBooking.status, 201);
    const restoredBody = await restoredBooking.json() as { booking: { id: string } };
    fixtureBookings.push(restoredBody.booking.id);
});

test("only admins can manage events and view attendee lists", async () => {
    const user = await createUser();
    const admin = await createUser("ADMIN");

    const unauthenticatedResponse = await request("/events", {
        method: "POST",
        body: {
            title: "Unauthorized event",
            description: "This should not be created.",
            date: new Date(Date.now() + 86_400_000).toISOString(),
            venue: "Test venue",
            totalSeats: 10,
        },
    });
    assert.equal(unauthenticatedResponse.status, 401);

    const userResponse = await request("/events", {
        method: "POST",
        token: tokenFor(user),
        body: {
            title: "Unauthorized event",
            description: "This should not be created.",
            date: new Date(Date.now() + 86_400_000).toISOString(),
            venue: "Test venue",
            totalSeats: 10,
        },
    });
    assert.equal(userResponse.status, 403);

    const adminResponse = await request("/events", {
        method: "POST",
        token: tokenFor(admin),
        body: {
            title: "Admin test event",
            description: "Created by an admin integration test.",
            date: new Date(Date.now() + 86_400_000).toISOString(),
            venue: "Test venue",
            totalSeats: 10,
        },
    });
    assert.equal(adminResponse.status, 201);
    const adminBody = await adminResponse.json() as { newEvent: { id: string } };
    fixtureEvents.push(adminBody.newEvent.id);

    const attendeeResponse = await request(`/booking/event/${adminBody.newEvent.id}`, {
        token: tokenFor(user),
    });
    assert.equal(attendeeResponse.status, 403);

    const adminAttendeeResponse = await request(`/booking/event/${adminBody.newEvent.id}`, {
        token: tokenFor(admin),
    });
    assert.equal(adminAttendeeResponse.status, 200);
});
