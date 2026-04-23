# syntax=docker/dockerfile:1.7

ARG PHP_VERSION=8.4
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS node-base

FROM php:${PHP_VERSION}-cli-bookworm AS php-deps

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        libicu-dev \
        libpq-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock artisan ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader

COPY . .

RUN php artisan wayfinder:generate --with-form --no-interaction

FROM php-deps AS assets

COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && ln -sf ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack

RUN corepack enable

RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM php:${PHP_VERSION}-fpm-bookworm AS app

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libicu-dev \
        libpq-dev \
        libzip-dev \
    && docker-php-ext-install \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY docker/php/production.ini /usr/local/etc/php/conf.d/production.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php/entrypoint.sh /usr/local/bin/docker-entrypoint

COPY --from=php-deps --chown=www-data:www-data /var/www/html ./
COPY --from=assets --chown=www-data:www-data /var/www/html/public/build ./public/build

RUN chmod +x /usr/local/bin/docker-entrypoint \
    && mkdir -p \
        bootstrap/cache \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data bootstrap/cache storage

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint"]
CMD ["php-fpm", "-F"]

FROM nginx:1.27-alpine AS web

WORKDIR /var/www/html

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=assets /var/www/html/public ./public

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/up >/dev/null || exit 1
