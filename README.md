# NestJS REST API - Industry Standard Architecture

A production-ready REST API built with NestJS, Prisma ORM, and PostgreSQL using Docker.

## 🧠 Core Principles

- **Feature-first (domain-driven)**, not type-first
- **REST and GraphQL share the same business logic** (ready for GraphQL addition)
- **Transport layer stays thin** - business logic in services
- **Easy to scale to microservices later**

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
│
├── config/                    # Environment & app configuration
│   ├── app.config.ts
│   ├── database.config.ts
│   └── index.ts
│
├── prisma/                    # Database layer
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── modules/                   # FEATURE / DOMAIN BASED
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts    # REST
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       ├── query-user.dto.ts
│   │       └── user-response.dto.ts
│   │
│   └── post/
│       ├── post.module.ts
│       ├── post.service.ts
│       ├── post.controller.ts    # REST
│       └── dto/
│
├── common/                    # CROSS-CUTTING CONCERNS
│   ├── constants/             # App constants
│   ├── decorators/            # Custom decorators (@CurrentUser, @Roles, @Public)
│   ├── guards/                # Auth guards (RolesGuard)
│   ├── filters/               # Exception filters
│   ├── interceptors/          # Logging, Transform interceptors
│   ├── dto/                   # Shared DTOs (PaginationDto)
│   └── types/                 # Type definitions
│
├── shared/                    # REUSABLE BUT NOT GLOBAL (future)
│   ├── mail/
│   ├── redis/
│   └── storage/
│
└── health/                    # Infrastructure endpoints
    ├── health.module.ts
    └── health.controller.ts
```

## 🚀 Features

- **NestJS** - Progressive Node.js framework
- **Prisma** - Modern ORM for TypeScript & Node.js
- **PostgreSQL** - Robust relational database (Docker)
- **Swagger** - API documentation
- **Class Validator** - Request validation
- **Docker Compose** - Container orchestration
- **Industry Standard Architecture** - Scalable, maintainable code structure

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🛠️ Getting Started

### 1. Fix npm permissions (if needed)

```bash
sudo chown -R $(whoami) ~/.npm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

### 4. Set up Prisma

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

Seed the database (optional):

```bash
npm run prisma:seed
```

### 5. Start the Application

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the app is running, access Swagger documentation at:

```
http://localhost:3000/api
```

## 🔧 Available Scripts

| Script                    | Description              |
| ------------------------- | ------------------------ |
| `npm run start`           | Start the app            |
| `npm run start:dev`       | Start in watch mode      |
| `npm run start:prod`      | Start in production mode |
| `npm run build`           | Build the app            |
| `npm run prisma:generate` | Generate Prisma Client   |
| `npm run prisma:migrate`  | Run migrations           |
| `npm run prisma:studio`   | Open Prisma Studio       |
| `npm run prisma:seed`     | Seed the database        |
| `npm run lint`            | Lint the code            |
| `npm run test`            | Run tests                |

## 📝 API Endpoints

### Health

- `GET /health` - Health check (with DB status)
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe

### Users

- `GET /users` - Get all users (with pagination)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Posts

- `GET /posts` - Get all posts (with pagination)
- `GET /posts/published` - Get published posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create a new post
- `PATCH /posts/:id` - Update post
- `PATCH /posts/:id/publish` - Publish post
- `PATCH /posts/:id/unpublish` - Unpublish post
- `DELETE /posts/:id` - Delete post

## 🗄️ Database Management

Open Prisma Studio (GUI for database):

```bash
npm run prisma:studio
```

## 🐳 Docker Commands

Start containers:

```bash
docker-compose up -d
```

Stop containers:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f postgres
```

Remove volumes (reset database):

```bash
docker-compose down -v
```

## 🏗️ Adding New Feature Modules

1. Create a new folder under `src/modules/`:

```bash
mkdir -p src/modules/your-feature/dto
```

2. Create the module, service, and controller:

```
src/modules/your-feature/
├── your-feature.module.ts
├── your-feature.service.ts
├── your-feature.controller.ts   # REST
├── your-feature.resolver.ts     # GraphQL (optional)
└── dto/
    ├── create-your-feature.dto.ts
    └── update-your-feature.dto.ts
```

3. Import the module in `app.module.ts`

## 📄 License

MIT
