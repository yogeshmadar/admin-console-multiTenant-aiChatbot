import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { GetManyDto } from "../dto/getmany-dto";



export class MessageThreadsController {

    async get(threadId: string) {
        try {
            const messageThread = await prisma.messageThreads.findFirst({
                where: {
                    ThreadID: threadId
                },
                include: {
                    Chatbot: true,
                    _count: {
                        select: {
                            Messages: true
                        }
                    }
                }
            });
            if (!messageThread) {
                throw {
                    message: "Message thread does not exist",
                    data: null,
                    statusCode: 400,
                }
            }
            return {
                data: {
                    thread_id: messageThread.ThreadID,
                    bot_id: messageThread.BotID,
                    bot_name: messageThread.Chatbot?.BotName,
                    subject: messageThread.Subject,
                    email: messageThread.Email,
                    first_name: messageThread.FirstName,
                    last_name: messageThread.LastName,
                    created_date: messageThread.CreatedDate,
                    messages_count: messageThread._count.Messages
                },
            }

        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            const messageThreads = await prisma.messageThreads.findMany({
                include: {
                    Chatbot: true,
                    _count: {
                        select: {
                            Messages: true
                        }
                    },
                },
                orderBy: {
                    CreatedDate: 'desc'
                },
            });
            return {
                data: messageThreads.map((thread) => ({
                    thread_id: thread.ThreadID,
                    bot_id: thread.BotID,
                    bot_name: thread.Chatbot?.BotName,
                    subject: thread.Subject,
                    email: thread.Email,
                    first_name: thread.FirstName,
                    last_name: thread.LastName,
                    created_date: thread.CreatedDate,
                    messages_count: thread._count.Messages
                })),
            }

        } catch (error) {
            throw error;
        }
    }

    async getAllPaginated(dto: GetManyDto) {
        const page = dto.page ? Number(dto.page) : 1;
        const take = dto.limit ? Number(dto.limit) : 10;
        const skip = page === 1 ? 0 : (page - 1) * take;
        const filter = dto.filter;

        const whereQuery = filter ? {
           OR: [
                {
                    FirstName: { contains: filter }
                },
                {
                    Chatbot: {
                        BotName: { contains: filter }
                    }
                },
                {
                    Email: { contains: filter }
                }
            ]
        } satisfies Prisma.MessageThreadsWhereInput : undefined
        try {
            const messageThreads = await prisma.messageThreads.findMany({
                include: {
                    Chatbot: true,
                    _count: {
                        select: {
                            Messages: true
                        }
                    }
                },
                orderBy: {
                    CreatedDate: 'desc'
                },
                where: whereQuery,
                skip,
                take,
                
            });

            const threadIds = messageThreads.map(mt => mt.ThreadID)


            const likesCount = await prisma.messages.groupBy({
                by: ['ThreadID'],
                where: {
                    ThreadID: {
                        in: threadIds
                        },
                    Feedback: 'liked'
                },
                _count: {
                    Message: true
                }
            })

            const dislikesCount = await prisma.messages.groupBy({
                by: ['ThreadID'],
                where: {
                    ThreadID: {
                        in: threadIds
                        },
                    Feedback: 'disliked'
                },
                _count: {
                    Message: true
                }
            })

            const totalMessageThreadCount = await prisma.messageThreads.count({
                where: whereQuery
            })

            return {
                data: messageThreads.map((thread) => ({
                    thread_id: thread.ThreadID,
                    bot_id: thread.BotID,
                    bot_name: thread.Chatbot?.BotName,
                    subject: thread.Subject,
                    email: thread.Email,
                    phone: thread.Phone,
                    first_name: thread.FirstName,
                    last_name: thread.LastName,
                    created_date: thread.CreatedDate,
                    messages_count: thread._count.Messages,
                    likes: likesCount.find(x => x.ThreadID === thread.ThreadID)?._count.Message ?? 0,
                    dislikes: dislikesCount.find(x => x.ThreadID === thread.ThreadID)?._count.Message ?? 0
                })),
                total_count: totalMessageThreadCount,
                no_of_pages: Math.ceil(totalMessageThreadCount / Number(dto.limit))
            }

        } catch (error) {
            throw error;
        }
    }
}