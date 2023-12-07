#!/bin/bash
export $(egrep -v '^#' .env | xargs)

SEED_CONTENT=$(cat prisma/seed.sql)

SEED_CONTENT=$(echo "$SEED_CONTENT" | sed "s/ALCHEMY_API_TOKEN/$ALCHEMY_API_TOKEN/g")
SEED_CONTENT=$(echo "$SEED_CONTENT" | sed "s/DEFINED_API/$DEFINED_API/g")

#execute SEED_CONTENT using psql
echo "$SEED_CONTENT" | psql $DATABASE_URL

