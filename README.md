# CollabArt

---

## Project overview

This is a full‑stack web application for creating and sharing **pixel art drawings**. It includes:

- User **registration/login** (JWT authentication)
- Creating and saving pixel drawings to a database
- A **gallery** view with pagination and sorting
- **Like / dislike** reactions on drawings
- **Comments** on drawings
- **Real-time collaborative drawing** and **room chat** using WebSockets (Socket.IO)

The frontend communicates with the backend via a REST API, while collaboration features (pixel updates, cursor movement, chat, joining a room) are implemented with Socket.IO.

---

## Tech stack

### Frontend (`/client`)
- **Vue 3** + **TypeScript**
- **Vite** (dev server + build)
- **Pinia** for state management (e.g. `client/src/stores/AuthStore.ts`, `PictureStore.ts`)
- **Vue Router** for navigation (`client/src/router/index.ts`)
- **Vuetify 3** + **Material Design Icons** (`client/src/main.ts`)
- **socket.io-client** for real-time collaboration
- Testing/tooling: **Vitest**, `@vue/test-utils` (see `client/package.json`)

### Backend (`/server`)
- **Node.js** + **TypeScript**
- **Express** (REST API) (`server/src/app.ts`)
- **Socket.IO** for real-time communication (`server/src/socket.ts`)
- **PostgreSQL** database
- **TypeORM** for ORM/data access (`server/src/data-source.ts`)
- **JWT** authentication (`jsonwebtoken`)
- **bcrypt** for password hashing
- **Zod** for request validation (schemas + validation middleware, e.g. `server/src/routes/authRoutes.ts`)

### DevOps / runtime
- **Docker Compose** to run the full stack (DB + backend + frontend) (`docker-compose.yml`)
- Dockerfiles for backend and frontend (`server/Dockerfile`, `client/Dockerfile`)

---

## Repository structure

- `client/` – Vue frontend application (UI)
- `server/` – Express + Socket.IO + TypeORM backend (API + real-time)
- `docker-compose.yml` – runs Postgres + backend + frontend together
- `README.md` – project documentation

---

## Main features

### Authentication
REST endpoints:
- `POST /auth/register` – create a user
- `POST /auth/login` – login and receive a JWT token

Frontend stores the token/username/userId (Pinia) and attaches:
- `Authorization: Bearer <token>`  
to authenticated requests (see `client/src/stores/AuthStore.ts`).

### Pictures (pixel drawings) & Gallery
Picture endpoints (`server/src/routes/pictureRoutes.ts`):
- `GET /pictures` – list pictures (supports query params such as `page`, `limit`, `author`, `older_first`)
- `GET /pictures/:id` – fetch a single picture
- `POST /pictures` – create a picture (**auth required**)
- `PATCH /pictures/:id` – rename/update (**auth required**)
- `DELETE /pictures/:id` – delete (**auth required**)
- `POST /pictures/:id/like` – like (**auth required**)
- `POST /pictures/:id/dislike` – dislike (**auth required**)
- `POST /pictures/:id/comment` – add a comment (**auth required**)
- `DELETE /pictures/comment/:id` – delete a comment (**auth required**)

Database entities:
- `User` (`server/src/entities/User.ts`)
- `Picture` (`server/src/entities/Picture.ts`)  
  - stores `picture_data` as JSON (`string[][]`) — a matrix of colors
- `Comment` (`server/src/entities/Comment.ts`)

### Real-time collaboration (Socket.IO)
Socket server is created in `server/src/app.ts`, with event handling in `server/src/socket.ts`.

Common events:
- `join-room(pictureId)` – join a room for a specific picture; server sends current picture state and list of connected users
- `pixel-change({ x, y, color })` – broadcast pixel updates to other users in the same room
- `cursor-move(...)` – share cursor positions
- `chat-message({ text, userId, username })` – send messages inside a picture room

---

## Running the project

### Option A (recommended): Docker Compose
From the repository root:

```bash
docker compose up --build
```

Services (from `docker-compose.yml`):
- PostgreSQL: `localhost:5432`
- Backend API: `http://localhost:3001`
- Frontend: `http://localhost:3000`

Default database credentials (from compose):
- user: `admin`
- password: `admin`
- db: `testdb`

Backend reads database config via environment variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
(see `docker-compose.yml` and `server/src/data-source.ts`).

### Option B: Run locally without Docker
Requirements:
- Node.js (the frontend targets Node **20+** per `client/package.json`)
- A local PostgreSQL instance

1) Backend
```bash
cd server
npm install
npm run build
node dist/app.js
# or dev mode:
# npm run dev
```

2) Frontend
```bash
cd client
npm install
npm run dev
```

Frontend expects the backend at:
- `http://localhost:3001` (see `client/src/types/api.ts`).

---

## Database seeding (test data)

On startup the backend initializes the database and runs a seed script:

- `server/src/app.ts` calls `seedDatabase()`
- `server/src/seedDatabase.ts` seeds the DB only if it is empty:
  - creates users like `stamen1` … `stamen10`
  - creates sample pictures for each user
  - default password for seeded users is: **`test1234`**

---

## Troubleshooting

- If the frontend cannot reach the backend, verify `API_BASE_URL` in:
  - `client/src/types/api.ts` (should be `http://localhost:3001`)
- If Docker has issues building/running, try resetting volumes:
  ```bash
  docker compose down -v
  docker compose up --build
  ```

---

## Author
Nikola Stamenković
