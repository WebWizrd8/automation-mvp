-- DropForeignKey
ALTER TABLE "chain_endpoint" DROP CONSTRAINT "chain_endpoint_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_chain" DROP CONSTRAINT "provider_chain_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_chain" DROP CONSTRAINT "provider_chain_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "endpoint" DROP CONSTRAINT "endpoint_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "event_tag_chain" DROP CONSTRAINT "event_tag_chain_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "event_tag_chain" DROP CONSTRAINT "event_tag_chain_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "event_tag_chain" DROP CONSTRAINT "event_tag_chain_endpoint_id_fkey";

-- DropForeignKey
ALTER TABLE "event_fetch_request" DROP CONSTRAINT "event_fetch_request_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "event_fetch_request" DROP CONSTRAINT "event_fetch_request_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "event_fetch_request_trigger_function" DROP CONSTRAINT "event_fetch_request_trigger_function_event_fetch_request_i_fkey";

-- DropForeignKey
ALTER TABLE "action" DROP CONSTRAINT "action_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "action" DROP CONSTRAINT "action_event_fetch_request_trigger_function_id_fkey";

-- DropForeignKey
ALTER TABLE "action_condition" DROP CONSTRAINT "action_condition_action_id_fkey";

-- DropForeignKey
ALTER TABLE "destination" DROP CONSTRAINT "destination_action_id_fkey";

-- DropTable
DROP TABLE "chain";

-- DropTable
DROP TABLE "chain_endpoint";

-- DropTable
DROP TABLE "provider";

-- DropTable
DROP TABLE "provider_chain";

-- DropTable
DROP TABLE "endpoint";

-- DropTable
DROP TABLE "event_tag";

-- DropTable
DROP TABLE "event_tag_chain";

-- DropTable
DROP TABLE "event_fetch_request";

-- DropTable
DROP TABLE "token_prices";

-- DropTable
DROP TABLE "event_fetch_request_trigger_function";

-- DropTable
DROP TABLE "action";

-- DropTable
DROP TABLE "action_condition";

-- DropTable
DROP TABLE "destination";

-- DropEnum
DROP TYPE "action_type";

-- DropEnum
DROP TYPE "connection_type";

