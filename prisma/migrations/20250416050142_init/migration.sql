/*
  Warnings:

  - You are about to drop the `user_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_user_id_fkey";

-- DropTable
DROP TABLE "user_profiles";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "UserAccountStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "service" VARCHAR(100),
    "environment" VARCHAR(20),
    "request_id" VARCHAR(100),
    "request_path" VARCHAR(255),
    "request_method" VARCHAR(10),
    "user_id" VARCHAR(100),
    "error_message" TEXT,
    "stack_trace" TEXT,
    "context" JSONB,
    "duration_ms" INTEGER,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_timestamp_level_idx" ON "logs"("timestamp", "level");

-- CreateIndex
CREATE INDEX "logs_request_path_timestamp_idx" ON "logs"("request_path", "timestamp");

-- CreateIndex
CREATE INDEX "logs_user_id_idx" ON "logs"("user_id");
