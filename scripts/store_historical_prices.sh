#!/bin/sh

if [ -z "$TEST_DATABASE_URL" ]; then
  echo "TEST_DATABASE_URL is not set, would be something like postgres://user:password@localhost:5432/dbname"
  exit 1
fi
DATABASE_URL=$TEST_DATABASE_URL

#check if the database url is set
TOKEN=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

#Convert the date to timestamp
FROM=$(date -j -f "%Y-%m-%d" "2023-09-06" +"%s")
TO=$((FROM + 86400))
for i in $(seq 0 90); do
  FROM=$(($FROM + 86400))
  TO=$(($TO + 86400))
  echo $FROM
  echo $TO
    
  DATA=$(cat <<EOF
  {"query":"query {\n  getBars(\n    symbol: \"${TOKEN}:1\"\n    from: ${FROM}\n    to: ${TO}\n    resolution: \"1\"\n  ) {\n    o\n    t\n  }\n}"}
EOF)

RESP=$(curl --request POST \
  --url https://graph.defined.fi/graphql \
  --header 'Content-Type: application/json' \
  --header 'authorization: 5V0VgKvwHM7yexi2k7Rmp6SEEQtV9Woq9y7GRKAk' \
  --data "$DATA")

PRICES=$(echo $RESP | jq -r '.data.getBars.o[]')
TIMESTAMPS=$(echo $RESP | jq -r '.data.getBars.t[]')

QUERY='INSERT INTO token_prices ("token_address", "chain_id", "priceUsd", "timestamp") VALUES '
COUNT=0
for i in $(seq 1 $(echo $PRICES | wc -w)); do
  QUERY="$QUERY
  ('${TOKEN}', 1, $(echo $PRICES | cut -d' ' -f$i), to_timestamp($(echo $TIMESTAMPS | cut -d' ' -f$i))),"
  COUNT=$(($COUNT + 1))
done
# remove the last comma and add a semicolon
QUERY=$(echo $QUERY | sed 's/,$//' )
#On conflict do nothing
QUERY="$QUERY ON CONFLICT DO NOTHING"
QUERY="$QUERY;"

echo $COUNT

psql $DATABASE_URL -c "$QUERY"

done
