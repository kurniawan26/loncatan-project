# Stage 1: Build stage (PHP + Node.js — keduanya dibutuhkan karena wayfinder
# memanggil `php artisan wayfinder:generate` saat `npm run build`)
FROM php:8.4-fpm-alpine AS builder

RUN apk add --no-cache \
    nodejs \
    npm \
    libpq-dev \
    libzip-dev \
    icu-dev

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    bcmath \
    pcntl \
    intl \
    zip \
    opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN printf 'APP_KEY=base64:%s\nAPP_ENV=local\nCACHE_STORE=array\nSESSION_DRIVER=array\nQUEUE_CONNECTION=sync\nDB_CONNECTION=pgsql\nDB_HOST=127.0.0.1\nDB_PORT=5432\nDB_DATABASE=build\nDB_USERNAME=build\nDB_PASSWORD=build\n' \
        "$(php -r 'echo base64_encode(random_bytes(32));')" > .env \
    && mkdir -p bootstrap/cache storage/framework/sessions storage/framework/cache/data storage/framework/views \
    && composer dump-autoload --optimize --no-dev \
    && php artisan wayfinder:generate --with-form \
    && npm run build \
    && rm -f .env

# Stage 2: Final runtime image — tanpa Node.js, npm, composer, dev headers
FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    libpq \
    libzip \
    icu-libs

RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        libpq-dev \
        libzip-dev \
        icu-dev \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        bcmath \
        pcntl \
        intl \
        zip \
        opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.revalidate_freq=0"; \
    echo "opcache.validate_timestamps=1"; \
    echo "memory_limit=256M"; \
    echo "upload_max_filesize=64M"; \
    echo "post_max_size=64M"; \
} > /usr/local/etc/php/conf.d/app.ini

WORKDIR /var/www/html

COPY --from=builder /var/www/html/vendor ./vendor
COPY --from=builder /var/www/html/public/build ./public/build
COPY . .

RUN mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache public/build

COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
