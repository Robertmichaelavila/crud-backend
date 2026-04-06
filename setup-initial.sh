#!/bin/sh

# step 1
pnpm install

# step 2
npx prisma generate

# step 3 (subir banco em background)
docker compose -f docker-compose.dev.yml up -d postgres

# espera banco subir
sleep 5

# step 4 (criar migration)
npx prisma migrate dev --name init

# step 5 (subir api)
docker compose -f docker-compose.dev.yml up -d --build

# step 6 (logs do servidor)
docker compose -f docker-compose.dev.yml logs -f api