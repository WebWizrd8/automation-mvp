-- CreateEnum
CREATE TYPE "action_type" AS ENUM ('discord', 'telegram', 'onchain', 'webhook');

-- CreateEnum
CREATE TYPE "connection_type" AS ENUM ('http', 'ws');

-- CreateTable
CREATE TABLE "chain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_endpoint" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "chain_endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "http_token" TEXT,
    "ws_token" TEXT,

    CONSTRAINT "provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_chain" (
    "provider_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "provider_chain" TEXT NOT NULL,

    CONSTRAINT "provider_chain_pkey" PRIMARY KEY ("provider_id","chain_id")
);

-- CreateTable
CREATE TABLE "endpoint" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "connection_kind" "connection_type" NOT NULL,
    "provider_id" INTEGER NOT NULL,

    CONSTRAINT "endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "event_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tag_chain" (
    "tag_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "endpoint_id" INTEGER NOT NULL,

    CONSTRAINT "event_tag_chain_pkey" PRIMARY KEY ("tag_id","chain_id")
);

-- CreateTable
CREATE TABLE "event_fetch_request" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "event_fetch_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_prices" (
    "token_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_prices_pkey" PRIMARY KEY ("token_address","chain_id","timestamp")
);

-- CreateTable
CREATE TABLE "event_fetch_request_trigger_function" (
    "id" SERIAL NOT NULL,
    "event_fetch_request_id" INTEGER NOT NULL,
    "function_name" TEXT NOT NULL,
    "function_args" JSONB,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "event_fetch_request_trigger_function_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action" (
    "id" SERIAL NOT NULL,
    "event_fetch_request_trigger_function_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "executed" INTEGER NOT NULL DEFAULT 0,
    "last_executed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "loop" BOOLEAN NOT NULL DEFAULT false,
    "loop_config" JSONB,

    CONSTRAINT "action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_condition" (
    "id" SERIAL NOT NULL,
    "action_id" INTEGER NOT NULL,
    "field" jsonpath NOT NULL,
    "operator" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "action_condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination" (
    "id" SERIAL NOT NULL,
    "action_id" INTEGER NOT NULL,
    "type" "action_type" NOT NULL,
    "destination_config" JSONB NOT NULL,

    CONSTRAINT "destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "endpoint_name_key" ON "endpoint"("name");

-- CreateIndex
CREATE UNIQUE INDEX "event_tag_name_key" ON "event_tag"("name");

-- AddForeignKey
ALTER TABLE "chain_endpoint" ADD CONSTRAINT "chain_endpoint_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "provider_chain" ADD CONSTRAINT "provider_chain_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_chain" ADD CONSTRAINT "provider_chain_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endpoint" ADD CONSTRAINT "endpoint_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tag_chain" ADD CONSTRAINT "event_tag_chain_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "event_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tag_chain" ADD CONSTRAINT "event_tag_chain_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tag_chain" ADD CONSTRAINT "event_tag_chain_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_fetch_request" ADD CONSTRAINT "event_fetch_request_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "event_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_fetch_request" ADD CONSTRAINT "event_fetch_request_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_fetch_request_trigger_function" ADD CONSTRAINT "event_fetch_request_trigger_function_event_fetch_request_i_fkey" FOREIGN KEY ("event_fetch_request_id") REFERENCES "event_fetch_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_event_fetch_request_trigger_function_id_fkey" FOREIGN KEY ("event_fetch_request_trigger_function_id") REFERENCES "event_fetch_request_trigger_function"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_condition" ADD CONSTRAINT "action_condition_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination" ADD CONSTRAINT "destination_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
