FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    icu-dev \
    nodejs \
    npm \
    zip \
    unzip

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    bcmath \
    pcntl \
    intl \
    zip \
    opcache

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
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

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /var/www/html

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
