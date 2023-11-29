-- DropForeignKey
ALTER TABLE "alert_destination" DROP CONSTRAINT "alert_destination_destination_id_fkey";

-- DropForeignKey
ALTER TABLE "discord_destination_payload" DROP CONSTRAINT "discord_destination_payload_destination_id_fkey";

-- DropForeignKey
ALTER TABLE "discord_destination_payload" DROP CONSTRAINT "discord_destination_payload_discord_destination_id_fkey";

-- DropForeignKey
ALTER TABLE "telegram_destination_payload" DROP CONSTRAINT "telegram_destination_payload_destination_id_fkey";

-- DropForeignKey
ALTER TABLE "telegram_destination_payload" DROP CONSTRAINT "telegram_destination_payload_telegram_destination_id_fkey";

-- AlterTable
ALTER TABLE "alert" ADD COLUMN     "destination_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "destination" DROP COLUMN "type",
ADD COLUMN     "target" JSONB NOT NULL;

-- DropTable
DROP TABLE "alert_destination";

-- DropTable
DROP TABLE "discord_destination";

-- DropTable
DROP TABLE "discord_destination_payload";

-- DropTable
DROP TABLE "telegram_destination";

-- DropTable
DROP TABLE "telegram_temporary_token";

-- DropTable
DROP TABLE "telegram_destination_payload";

-- DropEnum
DROP TYPE "action_type";

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

