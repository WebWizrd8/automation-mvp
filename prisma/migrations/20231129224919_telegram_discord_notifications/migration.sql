/*
  Warnings:

  - You are about to drop the column `destination_id` on the `alert` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `destination` table. All the data in the column will be lost.
  - Added the required column `type` to the `destination` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "action_type" AS ENUM ('discord', 'telegram');

-- DropForeignKey
ALTER TABLE "alert" DROP CONSTRAINT "alert_destination_id_fkey";

-- AlterTable
ALTER TABLE "alert" DROP COLUMN "destination_id";

-- AlterTable
ALTER TABLE "destination" DROP COLUMN "target",
ADD COLUMN     "type" "action_type" NOT NULL;

-- CreateTable
CREATE TABLE "alert_destination" (
    "id" SERIAL NOT NULL,
    "alert_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,

    CONSTRAINT "alert_destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_destination" (
    "id" UUID NOT NULL,
    "discord_user_id" TEXT NOT NULL,
    "webhook_url" TEXT NOT NULL,

    CONSTRAINT "discord_destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_destination_payload" (
    "id" SERIAL NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "discord_destination_id" UUID NOT NULL,
    "template" TEXT NOT NULL,

    CONSTRAINT "discord_destination_payload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_destination" (
    "id" UUID NOT NULL,
    "chat_id" TEXT NOT NULL,
    "telegram_user_id" TEXT NOT NULL,

    CONSTRAINT "telegram_destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_temporary_token" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_temporary_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_destination_payload" (
    "id" SERIAL NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "telegram_destination_id" UUID NOT NULL,
    "template" TEXT NOT NULL,

    CONSTRAINT "telegram_destination_payload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alert_destination" ADD CONSTRAINT "alert_destination_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discord_destination_payload" ADD CONSTRAINT "discord_destination_payload_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discord_destination_payload" ADD CONSTRAINT "discord_destination_payload_discord_destination_id_fkey" FOREIGN KEY ("discord_destination_id") REFERENCES "discord_destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telegram_destination_payload" ADD CONSTRAINT "telegram_destination_payload_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telegram_destination_payload" ADD CONSTRAINT "telegram_destination_payload_telegram_destination_id_fkey" FOREIGN KEY ("telegram_destination_id") REFERENCES "telegram_destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
