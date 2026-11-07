-- AlterTable
ALTER TABLE "Project" ADD COLUMN "webhookSecretEncrypted" TEXT;

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "event" TEXT NOT NULL,
    "action" TEXT,
    "outcome" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequestCheck" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prTitle" TEXT,
    "prUrl" TEXT,
    "headSha" TEXT NOT NULL,
    "baseSha" TEXT,
    "status" TEXT NOT NULL,
    "hasRegression" BOOLEAN NOT NULL DEFAULT false,
    "resultsSummary" TEXT,
    "details" JSONB,
    "deliveryId" TEXT,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PullRequestCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookDelivery_projectId_createdAt_idx" ON "WebhookDelivery"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "PullRequestCheck_projectId_createdAt_idx" ON "PullRequestCheck"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "PullRequestCheck_projectId_prNumber_idx" ON "PullRequestCheck"("projectId", "prNumber");

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequestCheck" ADD CONSTRAINT "PullRequestCheck_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

