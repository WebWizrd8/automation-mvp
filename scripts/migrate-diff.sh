#!/bin/bash
export $(egrep -v '^#' .env | xargs)
npx prisma migrate diff \
 --from-schema-datamodel prisma/schema.prisma \
 --to-migrations prisma/migrations \
 --shadow-database-url $SHADOW_DATABASE_URL \
 --script > down.sql

npx prisma migrate dev --create-only --name $1

# get list of dirs in prisma/migrations and match the one with $1
dir=$(ls -lUr prisma/migrations | grep ^d | awk '{print $NF}' | grep $1 | tail -1)
echo $dir
mv down.sql prisma/migrations/"${dir}"/down.sql
# ignore error if file doesn't exist
rm prisma/migrations/down.sql 2> /dev/null
