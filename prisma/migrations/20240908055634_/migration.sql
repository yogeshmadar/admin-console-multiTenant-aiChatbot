-- CreateTable
CREATE TABLE "Users" (
    "UserID" UUID NOT NULL,
    "Email" TEXT NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "FirstName" VARCHAR(50) NOT NULL,
    "LastName" VARCHAR(50),
    "CreatedDate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN DEFAULT true,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "MessageThreads" (
    "ThreadID" UUID NOT NULL,
    "BotID" UUID NOT NULL,
    "Subject" VARCHAR(255),
    "Email" VARCHAR(100) NOT NULL,
    "FirstName" VARCHAR(50) NOT NULL,
    "LastName" VARCHAR(50),
    "CreatedDate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "Phone" VARCHAR(20),

    CONSTRAINT "MessageThreads_pkey" PRIMARY KEY ("ThreadID")
);

-- CreateTable
CREATE TABLE "Messages" (
    "MessageID" UUID NOT NULL,
    "ThreadID" UUID NOT NULL,
    "SenderID" INTEGER NOT NULL,
    "ReceiverID" INTEGER NOT NULL,
    "Message" TEXT NOT NULL,
    "Feedback" VARCHAR(100),
    "SentDateTime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "Ip" VARCHAR(100),

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("MessageID")
);

-- CreateTable
CREATE TABLE "ChatBots" (
    "BotID" UUID NOT NULL,
    "BotName" VARCHAR(100) NOT NULL,
    "Description" TEXT NOT NULL,
    "ThemeColor" VARCHAR(100) NOT NULL,
    "PrivacyPolicy" TEXT,
    "SiteMapUrl" TEXT NOT NULL,
    "WhitelistedDomain" VARCHAR(255) NOT NULL,
    "CreatedDateTime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedDateTime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN DEFAULT true,
    "CrawlErrors" TEXT,
    "InitialMessage" VARCHAR(255),
    "HelpdeskUrl" TEXT,
    "CustomPrompt" TEXT,
    "InitialContext" VARCHAR(255),

    CONSTRAINT "ChatBots_pkey" PRIMARY KEY ("BotID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- AddForeignKey
ALTER TABLE "MessageThreads" ADD CONSTRAINT "MessageThreads_BotID_fkey" FOREIGN KEY ("BotID") REFERENCES "ChatBots"("BotID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_ThreadID_fkey" FOREIGN KEY ("ThreadID") REFERENCES "MessageThreads"("ThreadID") ON DELETE RESTRICT ON UPDATE CASCADE;
