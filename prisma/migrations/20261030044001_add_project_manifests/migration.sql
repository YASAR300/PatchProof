-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "detectedManifests" JSONB,
ADD COLUMN     "latestCommitSha" TEXT;
