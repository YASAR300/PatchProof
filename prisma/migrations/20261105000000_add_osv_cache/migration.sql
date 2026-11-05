-- CreateTable
CREATE TABLE "OsvCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OsvCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OsvCache_cacheKey_key" ON "OsvCache"("cacheKey");

-- CreateIndex
CREATE INDEX "OsvCache_cacheKey_idx" ON "OsvCache"("cacheKey");

-- CreateIndex
CREATE INDEX "OsvCache_expiresAt_idx" ON "OsvCache"("expiresAt");

