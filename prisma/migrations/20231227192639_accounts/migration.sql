-- CreateEnum
CREATE TYPE "address_type" AS ENUM ('wallet', 'email');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "address_type" "address_type",

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_factory" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_factory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_account" (
    "id" SERIAL NOT NULL,
    "user_address" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "factory_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smart_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_key" (
    "id" SERIAL NOT NULL,
    "session_key_address" TEXT NOT NULL,
    "smart_account_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "approved_call_targets" TEXT[],
    "native_token_limit" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "txn_hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_key_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "account_factory" ADD CONSTRAINT "account_factory_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "smart_account" ADD CONSTRAINT "smart_account_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "smart_account" ADD CONSTRAINT "smart_account_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "account_factory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session_key" ADD CONSTRAINT "session_key_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session_key" ADD CONSTRAINT "session_key_smart_account_id_fkey" FOREIGN KEY ("smart_account_id") REFERENCES "smart_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
