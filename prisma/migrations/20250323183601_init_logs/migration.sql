/*
  Warnings:

  - You are about to drop the `user_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS');

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
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "environment" VARCHAR(20),
    "service" VARCHAR(100),
    "subsystem" VARCHAR(100),
    "category" VARCHAR(50),
    "event_type" VARCHAR(100),
    "trace_id" VARCHAR(100),
    "span_id" VARCHAR(100),
    "parent_span_id" VARCHAR(100),
    "request_id" VARCHAR(100),
    "request_path" VARCHAR(255),
    "request_method" VARCHAR(10),
    "user_id" VARCHAR(100),
    "user_email" VARCHAR(255),
    "user_role" VARCHAR(50),
    "session_id" VARCHAR(100),
    "host" VARCHAR(255),
    "ip" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "duration_ms" INTEGER,
    "memory_usage_mb" DOUBLE PRECISION,
    "cpu_usage" DOUBLE PRECISION,
    "error_code" VARCHAR(100),
    "error_type" VARCHAR(255),
    "stack_trace" TEXT,
    "context" JSONB,
    "metadata" JSONB,
    "request_body" JSONB,
    "response_body" JSONB,
    "business_id" VARCHAR(100),
    "business_action" VARCHAR(100),
    "business_result" VARCHAR(100),
    "business_value" DOUBLE PRECISION,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_timestamp_level_service_idx" ON "Log"("timestamp", "level", "service");

-- CreateIndex
CREATE INDEX "Log_timestamp_user_id_idx" ON "Log"("timestamp", "user_id");

-- CreateIndex
CREATE INDEX "Log_level_timestamp_idx" ON "Log"("level", "timestamp");

-- CreateIndex
CREATE INDEX "Log_trace_id_idx" ON "Log"("trace_id");

-- CreateIndex
CREATE INDEX "Log_request_path_timestamp_idx" ON "Log"("request_path", "timestamp");

-- CreateIndex
CREATE INDEX "Log_business_id_idx" ON "Log"("business_id");
