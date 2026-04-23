#!/usr/bin/env sh
set -eu

mkdir -p \
    bootstrap/cache \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs

chown -R www-data:www-data bootstrap/cache storage

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

if [ "${APP_ENV:-production}" = "production" ]; then
    php artisan optimize --no-interaction
fi

exec "$@"
