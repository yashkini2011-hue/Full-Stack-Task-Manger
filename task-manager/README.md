# Task Manager

A full-stack task manager with JWT authentication and per-user data isolation.

## Features

- Email + password auth with bcrypt hashing
- Stateless JWT sessions (7-day expiry)
- Per-user task isolation enforced at the database query level
- Full CRUD: create, edit, complete, delete tasks
- Filter by status, priority levels, inline editing
- Global 401 handling - expired tokens redirect to login automatically

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, modern build tooling |
| Routing | React Router v6 | Standard, supports protected routes |
| HTTP | Axios | Interceptors for token attachment and global error handling |
| Backend | Node.js + Express | Minimal, well-understood |
| Database | MongoDB + Mongoose | Flexible schema, natural fit for user-scoped documents |
| Auth | bcryptjs + jsonwebtoken | Pure-JS bcrypt for portability; standard JWT |
| State | React Context | Single small slice (auth) - Redux would be overkill |

## Architecture

    React (Vite)  --Bearer token-->  Express requireAuth  --req.userId-->  MongoDB

Every task query is scoped by `req.userId` from the verified JWT. A user cannot read, edit, or delete another user's tasks - the database query physically cannot return them.

## Auth Flow

    REGISTER
      password -> bcrypt.hash(pw, 10) -> store hash in MongoDB
                                         (plaintext never persisted)

    LOGIN
      find user by email
      bcrypt.compare(plaintext, storedHash)
      -> jwt.sign({ userId }, SECRET, { expiresIn: '7d' })
      -> client stores token

    PROTECTED REQUEST
      Authorization: Bearer <token>
      -> jwt.verify() -> req.userId -> route handler
      -> DB query scoped to req.userId

## API Reference

All task routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | - | `{ user }` |

### Tasks

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/api/tasks` | - | `{ tasks: [] }` |
| POST | `/api/tasks` | `{ title, description?, priority?, dueDate? }` | `{ task }` |
| PATCH | `/api/tasks/:id` | any of the above | `{ task }` |
| DELETE | `/api/tasks/:id` | - | `{ message, task }` |

## Running Locally

    # 1. Install
    cd server && npm install && cd ..
    cd client && npm install && cd ..

    # 2. Configure backend (a .env was generated for you with a random secret)
    # Edit server/.env if you need a different MONGO_URI

    # 3. Run both (two terminals)
    cd server && npm run dev
    cd client && npm run dev

App runs at http://localhost:5173. Vite proxies `/api` to http://localhost:5000.

### Demo account (after `npm run seed` in server/)

    demo@example.com / password123

## Security Notes

- Passwords hashed with bcrypt at cost 10 - deliberately slow to resist brute force
- Login errors are generic ("Invalid credentials") - no username enumeration
- Unique index on `email` is the real duplicate guard; the `11000` error is caught
- Task queries scope by `req.userId` inside the Mongo filter - not a post-fetch check
- Not-owned and not-found both return `404` - no existence disclosure
- Updates build an explicit object from `req.body` - no mass assignment
- JWT stored in `localStorage` - see tradeoffs below

### Known Tradeoffs

| Decision | Tradeoff |
|---|---|
| JWT in `localStorage` | Vulnerable to XSS. `httpOnly` cookies are safer but require CSRF protection. |
| Stateless JWT, 7-day expiry | Cannot revoke before expiry without a token blocklist. |
| No refresh tokens | Simplest correct implementation. Production would use short-lived access + refresh. |

## What I'd Add Next

- Refresh tokens with rotation
- Rate limiting on `/auth/login` (e.g. `express-rate-limit`)
- Email verification on register
- Task sharing / collaboration
- Optimistic UI updates with rollback
- Integration tests (Jest + supertest)