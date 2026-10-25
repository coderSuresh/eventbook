# EventBook

EventBook is a small event booking application with a separate Next.js frontend and Express REST API.

## Current Status

Implemented in the repository:

- Upcoming event listing from the REST API with server-side `page` and `pageSize` pagination.
- Event detail and booking confirmation pages.
- Registration and login UI.
- Bearer access tokens kept in memory, with refresh-token rotation through an `HttpOnly` cookie.
- Backend booking transaction with row locking to protect the last available seat.
- Admin-protected event create, update, delete, and attendee-list API routes.
- User booking-list and cancellation API routes.

Not currently included:

- Live deployment URLs.
- Automated backend tests.

The repository includes a repeatable seed script with test accounts and sample data. Frontend event-title search and pagination controls are available on the homepage. Booking history and cancellation screens remain future work.

## Repository Layout

```text
backend/    Express API, Prisma 8 contract, authentication, event and booking rules
frontend/   Next.js App Router frontend and Axios service layer
```

The frontend and backend run separately. The frontend calls the backend API; database access is contained in the backend.

## Tech Stack

### Frontend

- Next.js `16.4.2` with the App Router
- React `19.3.0`
- TypeScript
- Tailwind CSS `4`
- Axios

### Backend

- Node.js with Express `5.3.0`
- TypeScript
- Prisma `8` ORM PostgreSQL contract
- PostgreSQL through `DATABASE_URL`
- Zod request validation
- bcrypt password hashing
- JWT access and refresh tokens
- `cookie-parser` and CORS
- Resend for verification email delivery

## Run Locally

### Backend

Requirements: Node.js, PostgreSQL, and a database matching the `DATABASE_URL`.

```bash
cd backend
npm install
copy .env.example .env
```

Set the values in `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventbook"
PORT=8000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
RESEND_API_KEY=replace-with-a-resend-key
```

Apply the Prisma 8 contract to the database, then start the API:

```bash
npm run contract:emit
npx prisma db update
npm run seed
npm run dev
```

The API runs at `http://localhost:8000` by default. Its health endpoint is `GET /status`.

For a production-style backend run:

```bash
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`.

Frontend checks:

```bash
npm run lint
npm run build
```

The backend seed command is idempotent for its deterministic fixture rows:

```bash
cd backend
npm run seed
```

## Frontend Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage with the first page of upcoming events |
| `/events/[id]` | Event title, date, time, venue, description, and booking link |
| `/events/[id]/book` | Protected booking confirmation page |
| `/login` | Login form |
| `/register` | Registration form |

The Next.js `proxy.ts` protects `/events/[id]/book` when the refresh-session cookie is absent. The backend still performs the authoritative authentication check, so the proxy is only a navigation guard.

## API

The API base path is `/api/v1`.

### Authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a user and start email verification |
| `POST` | `/auth/login` | Public | Verify credentials and return an access token |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate the refresh token and return a new access token |
| `POST` | `/auth/logout` | Public | Clear the refresh-token cookie |
| `GET` | `/auth/verify?token=...` | Public | Verify a registration email |

Access tokens are sent in the `Authorization: Bearer <token>` header. The refresh token is stored as an `HttpOnly`, `SameSite=Lax` cookie. The backend stores only its SHA-256 hash in `User.refreshTokenHash` and rotates the token on refresh.

### Events

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/events/upcoming?page=1&pageSize=10` | Public | Return active future events and pagination metadata |
| `GET` | `/events/search?query=...&page=1&pageSize=10` | Public | Search upcoming active events by title with pagination |
| `GET` | `/events/:id` | Public | Return one event |
| `GET` | `/events?page=1&pageSize=10` | Public | Return paginated events for admin views |
| `POST` | `/events` | Admin | Create an event |
| `PUT` | `/events/:id` | Admin | Update an event |
| `DELETE` | `/events/:id` | Admin | Delete or cancel an event |

`/events/upcoming` returns an object with `data` and `pagination`. `pageSize` is capped at 50 by the backend.
`/events` uses the same `data` and `pagination` response shape and is used by the admin event dashboard. The admin bookings dashboard loads all event pages when it needs a complete event selector.

### Bookings

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/booking` | User or admin | Create or restore one confirmed booking for an event |
| `GET` | `/booking/user` | User or admin | List the authenticated user's bookings |
| `DELETE` | `/booking/:bookingId` | User or admin | Cancel the authenticated user's confirmed booking |
| `GET` | `/booking/event/:eventId` | Admin | List bookings for an event |

## Data Model

- `User`: credentials, role (`USER` or `ADMIN`), email verification token, active state, and refresh-token hash.
- `Event`: title, text description, timestamp, venue, total seats, active state, and optional cancellation reason.
- `Booking`: user/event relationship, status (`CONFIRMED` or `CANCELLED`), and timestamps.

Seats are calculated from confirmed bookings compared with `Event.totalSeats`. Booking creation locks the event row inside a database transaction before checking capacity and writing the booking. The schema also has a partial unique index for one confirmed booking per user and event.

## Backend Rules

- A confirmed duplicate booking returns the existing booking instead of creating another one.
- A cancelled booking can be restored if the event still has capacity.
- Past or inactive events cannot be booked.
- A booking can only be cancelled by its owning user.
- Past-event bookings cannot be cancelled.
- Full events return a conflict response instead of overbooking.
- Admin event updates reject a seat total below the number of existing bookings.
- Deleting an event with no bookings removes it. Deleting an event with bookings soft-cancels it by setting `isActive` to `false` and recording the cancellation reason.
- Admin-only routes require a verified JWT with the `ADMIN` role.

## Security and Validation

- Passwords are hashed with bcrypt.
- Login and registration payloads are validated with Zod on the backend.
- Protected routes validate the access-token type and role server-side.
- Refresh tokens are rotated and stored only as hashes in the database.
- Secrets are read from environment variables; `.env` is ignored by Git.
- Backend errors return JSON messages without stack traces.

## Test Accounts, Deployment, and Tests

The seed command creates these verified accounts, all using the password `EventBook@2026!`:

| Role | Email |
| --- | --- |
| Admin | `admin@eventbook.test` |
| User | `suresh@eventbook.test` |
| User | `maya@eventbook.test` |

It also creates twelve future events for pagination, one past event, one nearly-full event, one full event, and six confirmed bookings. There is no deployment URL yet.

Backend integration tests use Node's built-in test runner and a separate PostgreSQL database configured through `TEST_DATABASE_URL`. Copy `backend/.env.test.example`, set the test database URL, apply the contract, and run:

```bash
cd backend
npm test
```

## AI Usage

GitHub Copilot was used to assist with code auto complete, and this README, Google stitch for UI inspiration generation.
