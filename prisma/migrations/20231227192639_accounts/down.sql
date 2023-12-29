-- DropForeignKey
ALTER TABLE "account_factory" DROP CONSTRAINT "account_factory_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "smart_account" DROP CONSTRAINT "smart_account_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "smart_account" DROP CONSTRAINT "smart_account_factory_id_fkey";

-- DropForeignKey
ALTER TABLE "session_key" DROP CONSTRAINT "session_key_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "session_key" DROP CONSTRAINT "session_key_smart_account_id_fkey";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "account_factory";

-- DropTable
DROP TABLE "smart_account";

-- DropTable
DROP TABLE "session_key";

-- DropEnum
DROP TYPE "address_type";

