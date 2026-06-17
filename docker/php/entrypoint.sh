#!/bin/sh
set -e

# (Opsional) Tetap pertahankan jika memang dibutuhkan, 
# tapi idealnya composer install dilakukan saat docker build
if [ ! -f "vendor/autoload.php" ]; then
    echo "==> Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

rm -f public/hot

if [ "${CONTAINER_ROLE:-app}" = "app" ]; then
    if [ -d /var/www/html/.public-original ]; then
        cp -r /var/www/html/.public-original/. /var/www/html/public/
    fi
    php artisan storage:link --no-interaction 2>/dev/null || true
    php artisan migrate --force --no-interaction

    echo "==> Clearing and optimizing Laravel cache..."
    php artisan optimize:clear
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

exec "$@"
