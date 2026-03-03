-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverImageAlt" TEXT,
    "seoTitle" TEXT,
    "metaDesc" TEXT,
    "canonical" TEXT,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "source" TEXT,
    "seoTitle" TEXT,
    "metaDesc" TEXT,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsData" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "clinicId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gscClicks" INTEGER NOT NULL DEFAULT 0,
    "gscImpressions" INTEGER NOT NULL DEFAULT 0,
    "gscCtr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gscAvgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gmbPhoneCalls" INTEGER NOT NULL DEFAULT 0,
    "gmbWebsiteClicks" INTEGER NOT NULL DEFAULT 0,
    "gmbDirectionRequests" INTEGER NOT NULL DEFAULT 0,
    "gmbActions" INTEGER NOT NULL DEFAULT 0,
    "gmbProfileViews" INTEGER NOT NULL DEFAULT 0,
    "gmbReviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "visitorId" TEXT,
    "language" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "report" TEXT,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactLead" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "businessType" TEXT,
    "budget" TEXT,
    "message" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "plan" TEXT,
    "planId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "appointments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientClinic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientClinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyAnalytics" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "blogsPublished" INTEGER NOT NULL DEFAULT 0,
    "avgRanking" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTraffic" INTEGER NOT NULL DEFAULT 0,
    "callsRequested" INTEGER NOT NULL DEFAULT 0,
    "websiteVisits" INTEGER NOT NULL DEFAULT 0,
    "directionClicks" INTEGER NOT NULL DEFAULT 0,
    "metaImpressions" INTEGER NOT NULL DEFAULT 0,
    "metaClicks" INTEGER NOT NULL DEFAULT 0,
    "metaCTR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metaConversions" INTEGER NOT NULL DEFAULT 0,
    "metaAdSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "googleImpressions" INTEGER NOT NULL DEFAULT 0,
    "googleClicks" INTEGER NOT NULL DEFAULT 0,
    "googleCTR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "googleCPC" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "googleConversions" INTEGER NOT NULL DEFAULT 0,
    "googleCVR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "googleCostPerConversion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "googleTotalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "socialPosts" INTEGER NOT NULL DEFAULT 0,
    "socialViews" INTEGER NOT NULL DEFAULT 0,
    "patientCount" INTEGER NOT NULL DEFAULT 0,
    "digitalConversion" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyPatientAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GMBConnection" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "businessAccountId" TEXT,
    "businessLocationId" TEXT,
    "businessName" TEXT,
    "locationName" TEXT,
    "locationAddress" TEXT,
    "googleEmail" TEXT,
    "connectionStatus" TEXT NOT NULL DEFAULT 'connected',
    "lastSyncedAt" TIMESTAMP(3),
    "nextSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'idle',
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GMBConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GMBData" (
    "id" TEXT NOT NULL,
    "gmbConnectionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "discovery" INTEGER NOT NULL DEFAULT 0,
    "directionRequests" INTEGER NOT NULL DEFAULT 0,
    "phoneImpressions" INTEGER NOT NULL DEFAULT 0,
    "phoneCalls" INTEGER NOT NULL DEFAULT 0,
    "websiteClicks" INTEGER NOT NULL DEFAULT 0,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newReviews" INTEGER NOT NULL DEFAULT 0,
    "questions" INTEGER NOT NULL DEFAULT 0,
    "answers" INTEGER NOT NULL DEFAULT 0,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "activePosts" INTEGER NOT NULL DEFAULT 0,
    "isOpenNow" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GMBData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PostCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "AnalyticsData_userId_idx" ON "AnalyticsData"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsData_clinicId_idx" ON "AnalyticsData"("clinicId");

-- CreateIndex
CREATE INDEX "AnalyticsData_date_idx" ON "AnalyticsData"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_sessionKey_key" ON "ChatSession"("sessionKey");

-- CreateIndex
CREATE INDEX "ChatSession_startedAt_idx" ON "ChatSession"("startedAt");

-- CreateIndex
CREATE INDEX "ChatSession_lastMessageAt_idx" ON "ChatSession"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_subscribedAt_idx" ON "NewsletterSubscriber"("subscribedAt");

-- CreateIndex
CREATE INDEX "ContactLead_createdAt_idx" ON "ContactLead"("createdAt");

-- CreateIndex
CREATE INDEX "ContactLead_status_idx" ON "ContactLead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Clinic_type_idx" ON "Clinic"("type");

-- CreateIndex
CREATE INDEX "ClientClinic_userId_idx" ON "ClientClinic"("userId");

-- CreateIndex
CREATE INDEX "ClientClinic_clinicId_idx" ON "ClientClinic"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientClinic_userId_clinicId_key" ON "ClientClinic"("userId", "clinicId");

-- CreateIndex
CREATE INDEX "WeeklyAnalytics_clinicId_idx" ON "WeeklyAnalytics"("clinicId");

-- CreateIndex
CREATE INDEX "WeeklyAnalytics_year_month_weekNumber_idx" ON "WeeklyAnalytics"("year", "month", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyAnalytics_clinicId_year_month_weekNumber_key" ON "WeeklyAnalytics"("clinicId", "year", "month", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GMBConnection_clinicId_key" ON "GMBConnection"("clinicId");

-- CreateIndex
CREATE INDEX "GMBConnection_clinicId_idx" ON "GMBConnection"("clinicId");

-- CreateIndex
CREATE INDEX "GMBConnection_businessAccountId_idx" ON "GMBConnection"("businessAccountId");

-- CreateIndex
CREATE INDEX "GMBConnection_lastSyncedAt_idx" ON "GMBConnection"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "GMBData_gmbConnectionId_idx" ON "GMBData"("gmbConnectionId");

-- CreateIndex
CREATE INDEX "GMBData_date_idx" ON "GMBData"("date");

-- CreateIndex
CREATE UNIQUE INDEX "GMBData_gmbConnectionId_date_key" ON "GMBData"("gmbConnectionId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "_PostTags_AB_unique" ON "_PostTags"("A", "B");

-- CreateIndex
CREATE INDEX "_PostTags_B_index" ON "_PostTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PostCategories_AB_unique" ON "_PostCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_PostCategories_B_index" ON "_PostCategories"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientClinic" ADD CONSTRAINT "ClientClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientClinic" ADD CONSTRAINT "ClientClinic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyAnalytics" ADD CONSTRAINT "WeeklyAnalytics_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GMBConnection" ADD CONSTRAINT "GMBConnection_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GMBData" ADD CONSTRAINT "GMBData_gmbConnectionId_fkey" FOREIGN KEY ("gmbConnectionId") REFERENCES "GMBConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

