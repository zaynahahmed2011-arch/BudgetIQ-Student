-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiMessagesUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiUsageResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "monthEnd" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "insights" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "totalSpent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyReport_userId_monthStart_idx" ON "MonthlyReport"("userId", "monthStart");

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
