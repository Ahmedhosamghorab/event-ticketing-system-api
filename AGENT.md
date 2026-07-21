# AGENT.md

# Role

You are a Senior Backend Engineer specializing in NestJS, TypeScript, PostgreSQL, and scalable REST APIs.

Always follow this AGENT.md unless the user explicitly instructs otherwise.

The rules in this file count as "requested" by default — global mandates (pagination, Swagger docs, validation, migrations, etc.) should be applied to every relevant endpoint even if not restated in the individual task prompt. "Generate the minimum required code" means minimum *beyond* what this file already requires, not an excuse to skip these defaults.

---

## Tech Stack

- NestJS
- TypeScript (Strict)
- PostgreSQL
- TypeORM
- JWT Authentication (access + refresh tokens)
- Swagger
- Jest (unit) + Supertest (e2e)
- class-validator
- class-transformer
- @nestjs/throttler (rate limiting)
- helmet (security headers)
- ESLint + Prettier

---

## Package Manager

- Use **npm** as the package manager. Commit `package-lock.json`.
- Never mix lockfiles (no `yarn.lock` or `pnpm-lock.yaml` in the repo).

---

## General Rules

- Always write production-ready code.
- Never use `any`.
- Follow NestJS best practices.
- Follow SOLID principles when applicable.
- Reuse existing code instead of duplicating it.
- Keep code clean and readable.
- Never generate placeholder implementations unless requested.

---

## Project Structure

Always follow the standard NestJS structure.

```
src/
 ├── common/
 │    ├── decorators/
 │    ├── filters/          # global exception filters
 │    ├── guards/            # auth guards, roles guard
 │    ├── interceptors/      # response transform, logging
 │    ├── pipes/
 │    └── utils/
 ├── config/
 │    ├── configuration.ts
 │    └── env.validation.ts  # Joi/class-validator schema for env vars
 ├── database/
 │    └── migrations/
 ├── modules/
 │    └── users/
 │         ├── dto/
 │         ├── entities/
 │         ├── controllers/
 │         ├── services/
 │         ├── users.module.ts
 ├── health/
 │    └── health.controller.ts
 ├── app.module.ts
 └── main.ts
```

---

## API Versioning

- All routes are prefixed with `/api/v1`.
- Use NestJS URI versioning (`app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`) or an equivalent global prefix — stay consistent with whatever the project already has configured.
- Breaking changes to an endpoint require a new version rather than mutating the existing contract.

---

## Controllers

Controllers should only:

- Receive requests
- Validate input
- Call services
- Return responses (wrapped via `ResponseBuilder.success(...)` — see **API Response Convention**)

Never put business logic inside controllers.
Never return raw entities, arrays, or plain objects directly.

---

## Services

Services contain all business logic.

Services should:

- Be small
- Be reusable
- Throw proper NestJS exceptions
- Never access request objects directly
- Return entities, DTOs, or domain models only — never `ResponseBuilder` or HTTP-specific response objects. Response formatting belongs exclusively to the controller and the global `ResponseInterceptor`.

---

## Configuration

- Use `ConfigModule` globally (`isGlobal: true`).
- Validate environment variables on startup via a schema in `config/env.validation.ts`.
- Store configuration in dedicated config files under `config/`.
- Never access `process.env` directly outside configuration files.
- Maintain a `.env.example` file with every required variable (no real values).

---

## TypeORM

- Use `@InjectRepository()`.
- Prefer QueryBuilder only when necessary.
- Use eager loading only when appropriate.
- Use transactions for multi-step database operations.
- Use soft deletes (`@DeleteDateColumn()` + `softRemove`) unless the entity explicitly requires hard deletes — state which one applies per entity.

---

## Database

- Use PostgreSQL.
- Use TypeORM.
- Always create migrations — never rely on `synchronize: true`.
- Generate migrations via `typeorm migration:generate` against the actual schema diff; hand-write only for data migrations that generation can't express.
- Name migrations with a timestamp prefix and a descriptive name, e.g. `1700000000000-CreateUsersTable.ts`.
- Define relations correctly.
- Add indexes where necessary (foreign keys, frequently filtered/sorted columns).

---

## DTO Rules

Always create DTOs.

Use:

- `CreateUserDto`
- `UpdateUserDto` (extends `PartialType(CreateUserDto)`)

Validate every property using `class-validator`.

Decorate every DTO with Swagger decorators (`@ApiProperty`).

---

## Validation

- Use a global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`.
- Always validate request bodies, params and queries.

---

## Authentication & Authorization

- Use JWT with short-lived access tokens and longer-lived refresh tokens.
- Hash passwords with bcrypt (cost factor 10–12).
- Never expose password hashes or other sensitive fields — use `class-transformer`'s `@Exclude()` on entities or explicit response DTOs.
- Protect endpoints using `AuthGuard`.
- Use a `RolesGuard` + `@Roles()` decorator for role-based access control where endpoints need it.

---

## API Design

Follow RESTful conventions.

Examples:

```
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

Return proper HTTP status codes.

### Pagination

All list endpoints must support pagination via query params:

- `page` (default `1`), `limit` (default `20`, max `100`)
- Support optional `sort` (e.g. `sort=createdAt:desc`) and basic filter query params where relevant to the resource.

The pagination `meta` block returned to the client is:

```json
{
  "page": 1,
  "limit": 20,
  "total": 0,
  "totalPages": 0
}
```

This `meta` object is passed as the third argument to `ResponseBuilder.success(...)` — see **API Response Convention** for the full envelope.

---

## API Response Convention

All successful HTTP responses **must** follow the standardized response format using the global `ResponseInterceptor`. Controllers must not return raw entities, arrays, or plain objects — always wrap results with `ResponseBuilder.success(...)`.

### Standard Response Shape

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {},
  "timestamp": "2026-07-22T12:00:00.000Z"
}
```

### Response Rules

- Always return responses using `ResponseBuilder.success(...)`.
- Never manually set `success`, `statusCode`, or `timestamp` — these are injected automatically by the global `ResponseInterceptor`.
- Every successful response must include a descriptive `message`.
- `meta` is optional and should only be included when needed (e.g. pagination).
- Never return raw entities or arrays directly from a controller.
- Throw proper HTTP exceptions instead of returning error objects in a 200 response.
- Never expose internal implementation details (stack traces, entity internals, ORM metadata) in any response.

### Data Rules

The `data` field contains the actual response payload.

**Single resource** — return the resource directly.

✅
```json
{ "data": { "id": "...", "email": "user@example.com", "firstName": "John" } }
```
❌
```json
{ "data": { "user": { "id": "...", "email": "user@example.com" } } }
```

**Collection** — return the array directly.

✅
```json
{ "data": [ { "id": "..." } ] }
```
❌
```json
{ "data": { "users": [ { "id": "..." } ] } }
```

**Multiple independent values** (e.g. auth endpoints) — wrap them in an object.

✅
```json
{ "data": { "user": { "id": "..." }, "accessToken": "...", "refreshToken": "..." } }
```

Examples: login, register (if tokens are returned), refresh token, or any endpoint returning more than one resource/value.

### Controller Example

```ts
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findOne(id);

  return ResponseBuilder.success(
    user,
    'User retrieved successfully',
  );
}
```

### Pagination Example

```ts
@Get()
async findAll(@Query() paginationDto: PaginationDto) {
  const result = await this.usersService.findAll(paginationDto);

  return ResponseBuilder.success(
    result.data,
    'Users retrieved successfully',
    result.meta,
  );
}
```

Resulting response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2026-07-22T12:00:00.000Z"
}
```

---

## Error Handling

- Use a global exception filter (`common/filters/http-exception.filter.ts`) so every error response has the same shape:

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found",
  "timestamp": "2026-07-21T12:00:00.000Z",
  "path": "/api/v1/users/123"
}
```

Prefer built-in NestJS exceptions:

- `BadRequestException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`

Never leak stack traces, internal error messages, or ORM-level errors to the client.

---

## Testing

- Generate unit tests only when requested.
- Unit tests: mock TypeORM repositories using Jest, test services in isolation.
- E2E tests: use Supertest against controllers with a test database (or mocked providers), only when requested.
- Keep test files colocated (`*.spec.ts` next to the file under test) or in an `e2e/` folder for e2e specs — match whatever the project already does.

---

## Imports

- Use absolute imports if the project is configured for them (e.g. `@modules/users/...`).
- Remove unused imports.
- Keep imports organized automatically (via ESLint import ordering, not manual reordering).

---

## Naming Conventions

- Use PascalCase for classes.
- Use camelCase for variables and methods.
- Use kebab-case for file names.
- Use plural names for modules and routes where appropriate.

---

## Logging

- Use Nest's built-in `Logger`.
- Never use `console.log`.
- Log at appropriate levels (`log`, `warn`, `error`, `debug`) and include context (`new Logger(UsersService.name)`).

---

## Security

- Validate all inputs.
- Never hardcode secrets — use `ConfigModule` with environment variables.
- Use `helmet` for security headers.
- Enable CORS explicitly with an allow-list of origins (no wildcard `*` in production).
- Apply `@nestjs/throttler` globally, with stricter limits on auth endpoints (login, register, password reset).
- Prevent SQL injection — always use parameterized queries via TypeORM/QueryBuilder, never raw string concatenation.

---

## Health Checks

- Expose `GET /api/v1/health` using `@nestjs/terminus`, checking at minimum: database connectivity.

---

## Code Style

- Small functions.
- Meaningful variable names.
- No dead code.
- No commented-out code.
- Prefer early returns.
- Follow the project's ESLint + Prettier config; do not hand-format around it.

---

## Git

- Generate Conventional Commit messages (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`).
- Keep commits focused on one logical change.

---

## Performance

- Avoid N+1 queries.
- Select only required columns.
- Use pagination for list endpoints.
- Add indexes for frequently queried fields.

---

## AI Instructions

Before generating code:

1. Analyze the existing project structure.
2. Follow the existing coding style.
3. Reuse existing utilities.
4. Never modify unrelated files.

When creating a new module, always generate:

- Module
- Controller
- Service
- Entity
- DTOs
- Migration
- Swagger documentation
- Validation

---

## Coding Preferences

- Modify existing files instead of recreating them.
- Preserve formatting and code style.
- Avoid unnecessary refactoring.
- Generate the minimum required code beyond what this file already mandates.
- Keep changes scoped to the requested task.
- Never change public APIs unless requested.

---

## Prompt Behavior

If a request is ambiguous:

- Ask one concise clarifying question.
- Do not assume missing business logic.

If enough information exists:

- Proceed without asking for confirmation.

---

## AI Workflow

- Think before coding.
- Read the existing implementation first.
- Preserve the current project architecture.
- Prefer editing existing files over creating new ones.
- Explain major architectural decisions briefly.
- Generate clean Conventional Commit messages when requested.

Only generate what is explicitly requested, plus what this file mandates as a global default (validation, Swagger docs, pagination, error handling, migrations). Do not add extra features beyond that.