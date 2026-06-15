#!/bin/bash
set -e

IMAGE="kurniawan026/loncatan-project"
VERSION=$(git rev-parse --short HEAD)

echo "==> Building image: $IMAGE:$VERSION"
docker build -f docker/php/Dockerfile \
  -t "$IMAGE:$VERSION" \
  -t "$IMAGE:latest" \
  .

echo "==> Pushing $IMAGE:$VERSION"
docker push "$IMAGE:$VERSION"

echo "==> Pushing $IMAGE:latest"
docker push "$IMAGE:latest"

echo ""
echo "Done! Deploy ke server dengan:"
echo "  IMAGE_TAG=$VERSION docker compose -f docker-compose.prod.yml pull"
echo "  IMAGE_TAG=$VERSION docker compose -f docker-compose.prod.yml up -d"
