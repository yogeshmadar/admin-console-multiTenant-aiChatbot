import prisma from "@/lib/prisma";

export class MessagesController {

    async getAllByBotAndThreadId(botId: string, threadId: string) {
        try {
            const messages = await prisma.messages.findMany({
                include: {
                    Thread: true
                },
                where: {
                    Thread: {
                        ThreadID: threadId,
                        BotID: botId,
                    }
                },
                orderBy: {
                    SentDateTime: 'asc'
                }
            });
            return {
                data: messages.map((message: any) => ({
                    thread_id: message.ThreadID,
                    bot_id: message.BotID,
                    sender_id: message.SenderID,
                    receiver_id: message.ReceiverID,
                    message: message.Message,
                    sent_date_time: message.SentDateTime,
                    feedback: message.Feedback
                })),
            }
        } catch (error) {
            throw error;
        }
    }
}


