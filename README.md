# ChatApp — Real-Time Messaging MVP

A working foundation for a WhatsApp-style chat app: JWT auth, 1:1 real-time
messaging over Socket.IO, typing indicators, online/last-seen status, and
delivered/seen receipts. Built to be extended feature by feature (groups,
media, calls, status, AI features, admin panel, etc.) rather than delivered
as one unmanageable mega-project.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT
- **Frontend:** React (Vite), Tailwind CSS, Socket.IO client, React Router

## What's included

- Register / login with hashed passwords (bcrypt) and JWT access tokens
- Real-time 1:1 messaging via Socket.IO (with a REST fallback endpoint)
- Typing indicators, online/offline presence, delivered & seen receipts
- Conversation list + user search
- Dark-themed, responsive chat UI
- Security basics: helmet, rate limiting, mongo-sanitize, input validation

## What's intentionally not built yet

Group chat/communities, media upload (Cloudinary), voice/video calls
(WebRTC), status/stories, push notifications, AI features, the admin
dashboard, Firebase phone OTP, Docker/CI setup, and tests. The models and
routes are structured so these slot in without a rewrite — ask for any of
these next and we'll build it on top of this base.

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas or local), JWT secrets
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

App runs on `http://localhost:5173`.

### 3. Try it out

Open two browser windows (or one normal + one incognito), register two
different accounts, search for the other user by name/username from the
sidebar, and start chatting — messages, typing indicators, and online
status update live via Socket.IO.

## Project structure

```
server/
  src/
    config/       # DB connection
    models/       # User, Conversation, Message (Mongoose schemas)
    middleware/    # JWT auth guard, error handler
    controllers/   # Route handlers
    routes/        # Express routers
    sockets/       # Socket.IO event handlers
    utils/         # Token helpers
    app.js         # Express app (middleware + routes)
    server.js      # HTTP server + Socket.IO bootstrap

client/
  src/
    context/       # Auth + Socket React contexts
    services/      # Axios API client
    components/    # Sidebar, ChatWindow, MessageBubble, ProtectedRoute
    pages/         # Login, Register, Chat
    App.jsx, main.jsx
```

## Note on verification

This environment has no outbound network access, so `npm install` for the
frontend couldn't be run here to confirm a full build — the code was
written and reviewed carefully, and the backend was syntax-checked with
Node directly, but please run `npm install && npm run dev` on your machine
as the real verification step, and let me know if anything doesn't come up
clean.
