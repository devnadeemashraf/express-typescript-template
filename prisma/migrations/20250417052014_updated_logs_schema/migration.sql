/*
  Warnings:

  - You are about to drop the `logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "logs";

-- CreateTable
CREATE TABLE "http_logs" (
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
    "status_code" INTEGER,
    "duration_ms" INTEGER,
    "context" JSONB,

    CONSTRAINT "http_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "error_name" VARCHAR(100),
    "stack_trace" TEXT,
    "service" VARCHAR(100),
    "environment" VARCHAR(20),
    "component" VARCHAR(100),
    "request_id" VARCHAR(100),
    "context" JSONB,

    CONSTRAINT "app_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "http_logs_timestamp_level_idx" ON "http_logs"("timestamp", "level");

-- CreateIndex
CREATE INDEX "http_logs_request_path_timestamp_idx" ON "http_logs"("request_path", "timestamp");

-- CreateIndex
CREATE INDEX "http_logs_user_id_idx" ON "http_logs"("user_id");

-- CreateIndex
CREATE INDEX "app_logs_timestamp_level_idx" ON "app_logs"("timestamp", "level");

-- CreateIndex
CREATE INDEX "app_logs_error_name_timestamp_idx" ON "app_logs"("error_name", "timestamp");
