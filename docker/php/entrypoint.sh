#!/bin/sh
set -e

if [ ! -f "vendor/autoload.php" ]; then
    echo "==> Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

php artisan storage:link --no-interaction 2>/dev/null || true
php artisan migrate --force --no-interaction

exec "$@"
