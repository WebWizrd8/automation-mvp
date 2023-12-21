INSERT INTO "public"."chain" ("id", "name")
		VALUES(1, 'Scroll Testnet'), (2, 'Ethereum Mainnet'), (3, 'Ethereum Sepolia Testnet');
INSERT INTO "public"."chain_endpoint" ("id", "chain_id", "type", "url")
		VALUES(1, 1, 'WS', 'ws://archive-node.sepolia.scroll.xyz:8546'), 
		(2, 2, 'WSS', 'wss://eth-mainnet.g.alchemy.com/v2/ALCHEMY_API_TOKEN');

INSERT INTO "public"."provider" ("id", "name", "createdAt", "updatedAt", "description", "http_token", "ws_token")
		VALUES(0, 'Alchemy', NOW(), NOW(), 'Alchemy Provider', '""', 'ALCHEMY_API_TOKEN'), (1, 'Defined', NOW(), NOW(), 'Defined.fi Provider', 'DEFINED_API', '""');

INSERT INTO "public"."provider_chain" ("provider_id", "chain_id", "provider_chain")
		VALUES(0, 2, '1'), (1, 2, '1');

INSERT INTO "public"."endpoint" ("id", "name", "createdAt", "updatedAt", "description", "connection_kind", "provider_id")
		VALUES(0, 'newHeads', NOW(), NOW(), 'Get new heads from the chain using Alchemy Ws', 'ws', 0), (1, 'getTokenPrices', NOW(), NOW(), 'Get token prices from Defined', 'http', 1);

INSERT INTO "public"."event_tag" ("id", "name", "createdAt", "updatedAt", "description")
		VALUES(0, 'GET_NEW_BLOCKS', NOW(), NOW(), 'Get new blocks form the chain'), (1, 'GET_SPOT_PRICE', NOW(), NOW(), 'Get Spot price from the chain');

INSERT INTO "public"."event_tag_chain" ("tag_id", "chain_id", "endpoint_id")
		VALUES(0, 2, 0), (1, 2, 1);

INSERT INTO "public"."event_fetch_request" ("id", "createdAt", "updatedAt", "tag_id", "chain_id", "payload", "added_by")
		VALUES(0, NOW(), NOW(), 0, 2, '{
   "jsonrpc": "2.0",
   "id": 2,
   "method": "eth_subscribe",
   "params": [
     "newHeads"
   ]
 }', 'test_user'), (1, NOW(), NOW(), 1, 2, '{
   "token": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
   "networkId": 1
 }', 'test_user');

INSERT INTO "public"."event_fetch_request_trigger_function" ("id", "event_fetch_request_id", "function_name", "added_by")
		VALUES(0, 1, 'SPOT_PRICE_MATCH', 'test_user'), (1, 1, 'SPOT_PRICE_CHANGE', 'test_user');

INSERT INTO "public"."action" ("id", "event_fetch_request_trigger_function_id", "user_id", "chain_id", "name","executed","last_executed_at","loop","loop_config")
		VALUES(0, 0, 'test_user', 2, 'test_action',0, NOW(), false, NULL), (1, 1, 'test_user', 2, 'test_alert', 0, NOW(), false, NULL);

INSERT INTO "public"."action_condition" ("action_id", "field", "operator", "value")
		VALUES( 0, '$."priceUsd"', 'gt', '2030'), ( 0, '$."address"', 'eq', '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"'), ( 1, '$."change_percentage"', 'gte', '3'), ( 1, '$."direction"', 'eq', '"UP"'), ( 1, '$."token_address"', 'eq', '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"'), ( 1, '$."chain_id"', 'eq', '2'), ( 1, '$."duration"', 'eq', '"30D"');

INSERT INTO "public"."destination" ("action_id", "type", "destination_config") VALUES
(0, 'telegram', '{"template": "ETH Price: {{priceUsd}}", "telegramChatId": "6200972469", "telegramUserId": "LakshyaSky"}'),
(0, 'discord', '{"template": "ETH Price: {{priceUsd}}", "discordUserId": "bruce_wayne", "discordWebhookUrl": "https://discord.com/api/webhooks/1179500410550095872/sN9S908S6Apqv9hlyw9xBPzLavPpqPb0UlQ1B-d4H6YHTdKY1LU8NElBj1fGeQnHOLr2"}'),
(1, 'discord', '{"template": "ETH Changed by {{change_percentage}} in {{duration}}.", "discordUserId": "bruce_wayne", "discordWebhookUrl": "https://discord.com/api/webhooks/1179500410550095872/sN9S908S6Apqv9hlyw9xBPzLavPpqPb0UlQ1B-d4H6YHTdKY1LU8NElBj1fGeQnHOLr2"}'),
(1, 'telegram', '{"template": "ETH Changed by {{change_percentage}} in {{duration}}.", "telegramChatId": "6200972469", "telegramUserId": "LakshyaSky"}');


CREATE TYPE public.condition_type AS (
	field jsonpath,
	operator text,
	value jsonb
);

CREATE OR REPLACE FUNCTION evaluate_conditions(event_data JSONB, conditions condition_type[])
  RETURNS boolean
  LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
  condition_record condition_type;
  field_name jsonpath;
  condition_value TEXT;
  reverted_json_operator TEXT;
  exists_path jsonpath;
BEGIN
  FOREACH condition_record IN ARRAY conditions
  LOOP
    field_name := condition_record.field;

    IF NOT jsonb_path_exists(event_data, field_name) THEN
      RETURN FALSE;
    END IF;
    
    reverted_json_operator := CASE condition_record.operator
      WHEN 'eq' THEN '!='
      WHEN 'neq' THEN '=='
      WHEN 'gt' THEN '<='
      WHEN 'lt' THEN '>='
      WHEN 'gte' THEN '<'
      WHEN 'lte' THEN '>'
    END;
    
    exists_path := CONCAT(field_name
      ,' ? (@ ', reverted_json_operator
      ,' '
      , condition_record.value
      , ' ) '
    )::jsonpath;
    
    IF jsonb_path_exists(
      event_data,
      exists_path
    ) THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;

$BODY$;

CREATE OR REPLACE FUNCTION public.evaluate_loop_conditions(action_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    action_record RECORD;
	max_executions int;
BEGIN
  SELECT a.loop as _loop, a.loop_config, a.executed INTO action_record FROM action a WHERE a.id = action_id;
  IF action_record._loop = FALSE THEN
    IF action_record.executed = 0 THEN
      RETURN TRUE;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;

  IF action_record.loop_config IS NOT NULL THEN
    IF jsonb_path_exists(action_record.loop_config, '$.max_executions') THEN
    	max_executions = (action_record.loop_config->>'max_executions')::int;
      IF action_record.executed >= max_executions THEN
        RETURN FALSE;
      ELSE
        RETURN TRUE;
      END IF;
    END IF;
  END IF;

  RETURN FALSE;
END;

$function$;

CREATE OR REPLACE FUNCTION find_matching_actions(event_data JSONB)
  RETURNS TABLE (action_id INT)

  LANGUAGE 'plpgsql'
AS $BODY$

DECLARE
  action_record RECORD;
  conditions_array condition_type[];
BEGIN
  FOR action_record IN 
  	SELECT a.id FROM action a
	INNER JOIN action_condition ac ON a.id = ac.action_id
	GROUP BY a.id
	HAVING COUNT(ac.id) >= 1
  LOOP
    SELECT ARRAY(
      SELECT (c.field, c.operator, c.value)::condition_type 
      FROM action_condition c 
      WHERE c.action_id = action_record.id
    ) INTO conditions_array;
        
    IF evaluate_conditions(event_data, conditions_array) AND evaluate_loop_conditions(action_record.id) THEN
      action_id := action_record.id;
      RETURN NEXT;
    END IF;
  END LOOP;

  RETURN;
END;

$BODY$;

select find_matching_actions('{"priceUsd": "2020", "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}');
select find_matching_actions('{
  "token": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "chain_id": 2,
  "duration": "30D",
  "change_percentage": 10.34243425,
  "changeUsd": 713.6668745306151,
  "direction": "UP"
}');
