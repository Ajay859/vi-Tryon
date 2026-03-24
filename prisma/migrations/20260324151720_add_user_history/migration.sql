-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userPhotoUpdatedat" TIMESTAMP(3),
ADD COLUMN     "userPhotourl" TEXT;

-- CreateTable
CREATE TABLE "tryOnHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPhotoUrl" TEXT,
    "clothUrl" TEXT,
    "resultUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tryOnHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tryOnHistory_userId_idx" ON "tryOnHistory"("userId");

-- AddForeignKey
ALTER TABLE "tryOnHistory" ADD CONSTRAINT "tryOnHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
