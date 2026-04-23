# Hotel Management

Hotel Management is a Laravel 13 application with an Inertia React frontend, Fortify authentication, Wayfinder route generation, PostgreSQL persistence, and Docker-based production-style runtime targets.

The repository supports two local workflows:

- Local application development with PHP, pnpm, and the shared infrastructure containers.
- Production-like Docker testing with Nginx, PHP-FPM, queue worker, scheduler, PostgreSQL, and Mailpit.

## Stack

| Area               | Technology             |
| ------------------ | ---------------------- |
| Backend            | PHP 8.4, Laravel 13    |
| Authentication     | Laravel Fortify        |
| Frontend           | React 19, Inertia v3   |
| Styling            | Tailwind CSS v4        |
| Route typing       | Laravel Wayfinder      |
| Database           | PostgreSQL 17          |
| Mail testing       | Mailpit                |
| Tests              | Pest 4, PHPUnit 12     |
| Static analysis    | Larastan, Rector       |
| Formatting         | Pint, Prettier         |
| Production runtime | Docker, PHP-FPM, Nginx |

## Requirements

For local development:

- PHP 8.4
- Composer 2
- Node.js 22
- pnpm 10.25
- Docker with Compose v2

For production-like Docker testing:

- Docker with Compose v2
- `make`

## Quick Start

Install dependencies and prepare the app:

```bash
composer install
pnpm install
cp .env.example .env
php artisan key:generate
```

Start PostgreSQL and Mailpit:

```bash
make infra-up
```

Run migrations:

```bash
php artisan migrate
```

Start the Laravel development workflow:

```bash
composer run dev
```

The local Laravel server defaults to `http://127.0.0.1:8000`. Mailpit is available at `http://127.0.0.1:8025`.

## Environment

The default `.env.example` is configured for local development against the infrastructure services in `compose.yml`.

Important values:

```ini
APP_NAME="Hotel Management"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=hotel-management
DB_USERNAME=postgres
DB_PASSWORD=postgres

CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
```

For production-like Docker runs, `compose.override.yml` overrides the runtime environment for containers:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=${DOCKER_APP_URL:-http://localhost:8080}`
- `DB_HOST=postgres`
- `LOG_CHANNEL=stderr`
- `RUN_MIGRATIONS=${RUN_MIGRATIONS:-true}`

Set a real `APP_KEY` before starting the production-like stack. The simplest local option is to reuse the generated key from `.env`.

## Make Targets

Run:

```bash
make help
```

Common targets:

| Target                           | Purpose                                               |
| -------------------------------- | ----------------------------------------------------- |
| `make infra-up`                  | Start only PostgreSQL and Mailpit from `compose.yml`. |
| `make infra-down`                | Stop only PostgreSQL and Mailpit.                     |
| `make up`                        | Start the production-like Docker stack.               |
| `make up BUILD=1`                | Rebuild and start the production-like Docker stack.   |
| `make down`                      | Stop the production-like Docker stack.                |
| `make ps`                        | Show production-like stack status.                    |
| `make logs SERVICE=app`          | Follow logs for a production-like service.            |
| `make shell SERVICE=app`         | Open a shell in a production-like service.            |
| `make artisan ARGS="route:list"` | Run an Artisan command in the app container.          |
| `make migrate`                   | Run migrations in the app container with `--force`.   |
| `make queue-restart`             | Gracefully restart Laravel queue workers.             |
| `make health`                    | Check Laravel's `/up` route through Nginx.            |
| `make nginx-test`                | Validate the Nginx configuration.                     |
| `make test`                      | Run the Pest test suite locally.                      |
| `make ci`                        | Run the local CI checks.                              |
| `make lint`                      | Run PHP and frontend linters.                         |
| `make format`                    | Format PHP and frontend files.                        |
| `make types`                     | Run TypeScript type checks.                           |

## Local Infrastructure

`compose.yml` defines shared development infrastructure:

- `postgres` on `${DB_PORT:-5432}`
- `mailpit` SMTP on `${MAIL_PORT:-1025}`
- `mailpit` dashboard on `${MAILPIT_DASHBOARD_PORT:-8025}`

Start it:

```bash
make infra-up
```

Stop it:

```bash
make infra-down
```

Follow logs:

```bash
make infra-logs INFRA_SERVICE=postgres
make infra-logs INFRA_SERVICE=mailpit
```

## Production-like Docker Stack

`compose.override.yml` extends `compose.yml` with production-style application services:

| Service     | Role                                              |
| ----------- | ------------------------------------------------- |
| `app`       | PHP-FPM Laravel application runtime.              |
| `nginx`     | Public HTTP entrypoint and static asset server.   |
| `queue`     | Long-running `php artisan queue:work` process.    |
| `scheduler` | Long-running `php artisan schedule:work` process. |
| `postgres`  | PostgreSQL database.                              |
| `mailpit`   | Local SMTP and email dashboard.                   |

Start the stack:

```bash
make up BUILD=1
```

Open the app:

```text
http://localhost:8080
```

Check health:

```bash
make health
```

Stop the stack:

```bash
make down
```

By default, the stack uses:

- `APP_PORT=8080`
- `DOCKER_APP_URL=http://localhost:8080`
- `RUN_MIGRATIONS=true`
- `SESSION_SECURE_COOKIE=false`

Override these from the shell when needed:

```bash
APP_PORT=8081 DOCKER_APP_URL=http://localhost:8081 make up BUILD=1
```

## Docker Image Targets

The `Dockerfile` exposes two production targets:

| Target | Description                                                                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app`  | PHP-FPM image with Composer production dependencies, Laravel app code, OPcache, production PHP settings, generated Wayfinder files, and built frontend assets. |
| `web`  | Nginx image with public assets and Laravel front-controller routing.                                                                                           |

Build them manually:

```bash
docker build --target app -t hotel-management-app .
docker build --target web -t hotel-management-nginx .
```

The asset build stage intentionally includes PHP because the Wayfinder Vite plugin runs `php artisan wayfinder:generate --with-form` during `pnpm run build`.

## Generated Files

Wayfinder generates TypeScript route/action files under:

- `resources/js/actions`
- `resources/js/routes`
- `resources/js/wayfinder`

These directories are ignored by Git and regenerated during builds. If route imports are missing during local development, regenerate them:

```bash
php artisan wayfinder:generate --with-form --no-interaction
```

## Tests and Quality

Run the test suite:

```bash
make test
```

Run the project CI checks:

```bash
make ci
```

Run individual checks:

```bash
composer lint:check
composer analyse
pnpm run lint:check
pnpm run format:check
pnpm run types:check
```

Format code:

```bash
make format
```

PHP files should be formatted with Pint:

```bash
vendor/bin/pint --format agent
```

## Deployment Notes for a DigitalOcean Droplet

This repository is ready for a Docker Compose deployment on a Droplet. A typical deployment flow is:

1. Provision a Droplet with Docker and the Compose plugin installed.
2. Clone the repository to the server.
3. Create a production `.env` or inject environment variables through your deployment process.
4. Set production secrets and URLs.
5. Build and start the stack.
6. Put HTTPS in front of the `nginx` service using a reverse proxy or host-level TLS setup.

Minimum production environment values:

```ini
APP_NAME="Hotel Management"
APP_ENV=production
APP_KEY=base64:replace-with-a-real-key
APP_DEBUG=false
DOCKER_APP_URL=https://your-domain.example
SESSION_SECURE_COOKIE=true

DB_DATABASE=hotel-management
DB_USERNAME=replace-with-db-user
DB_PASSWORD=replace-with-db-password

MAIL_MAILER=smtp
MAIL_HOST=replace-with-smtp-host
MAIL_PORT=587
MAIL_USERNAME=replace-with-smtp-user
MAIL_PASSWORD=replace-with-smtp-password
MAIL_FROM_ADDRESS=contact@your-domain.example
MAIL_FROM_NAME="${APP_NAME}"
```

Start on the Droplet:

```bash
make up BUILD=1
```

For repeat deployments, rebuild and restart:

```bash
git pull
make up BUILD=1
make queue-restart
```

The `app` container runs `php artisan optimize` automatically when `APP_ENV=production`. It also runs migrations by default when `RUN_MIGRATIONS=true`.

For stricter deployments, disable automatic migrations and run them explicitly:

```bash
RUN_MIGRATIONS=false make up BUILD=1
make migrate
```

## Operations

Check running services:

```bash
make ps
```

Follow logs:

```bash
make logs SERVICE=app
make logs SERVICE=nginx
make logs SERVICE=queue
make logs SERVICE=scheduler
```

Run Artisan:

```bash
make artisan ARGS="about"
make artisan ARGS="route:list --except-vendor"
make artisan ARGS="config:show app.name"
```

Open a shell:

```bash
make shell SERVICE=app
```

Validate Nginx:

```bash
make nginx-test
```

## Storage and Volumes

The production-like stack creates named Docker volumes:

- `hotel-management-pgdata` for PostgreSQL data.
- `hotel-management-app-storage` for Laravel `storage`.

Do not remove these volumes unless you intentionally want to delete local database or storage state.

## Troubleshooting

If frontend changes are missing locally:

```bash
pnpm run dev
```

or rebuild production assets:

```bash
pnpm run build
```

If route/action imports under `@/routes` or `@/actions` are missing:

```bash
php artisan wayfinder:generate --with-form --no-interaction
```

If production-like containers are using stale images:

```bash
make up BUILD=1
```

If Laravel configuration looks stale in the production-like container:

```bash
make artisan ARGS="optimize:clear"
make artisan ARGS="optimize"
```

If queue jobs are not picking up new code:

```bash
make queue-restart
```

If local database state needs a full reset:

```bash
make down
docker volume rm hotel-management-pgdata
make up BUILD=1
```

Only remove volumes when the data can be discarded.

## Repository Layout

```text
app/                  Laravel application code
bootstrap/            Laravel bootstrap and cached files
config/               Laravel configuration
database/             Migrations, factories, and seeders
docker/               Production PHP-FPM and Nginx configuration
public/               Public Laravel entrypoint and built assets
resources/css/        Application styles
resources/js/         Inertia React frontend
routes/               Web, settings, and console routes
storage/              Runtime storage
tests/                Pest test suite
compose.yml           Local infrastructure services
compose.override.yml  Production-like application services
Dockerfile            Production app and web image targets
Makefile              Common development and Docker commands
```
