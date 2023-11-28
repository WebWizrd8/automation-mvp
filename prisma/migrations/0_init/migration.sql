-- CreateTable
CREATE TABLE "alert" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_condition" (
    "id" SERIAL NOT NULL,
    "alert_id" INTEGER NOT NULL,
    "field" jsonpath NOT NULL,
    "operator" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "alert_condition_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "destination" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "target" JSONB NOT NULL,

    CONSTRAINT "destination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chain_endpoint" ADD CONSTRAINT "chain_endpoint_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

