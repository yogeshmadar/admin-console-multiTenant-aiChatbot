import prisma from "@/lib/prisma";
import { ChatbotController } from "./ChatbotController";
import { Prisma } from "@prisma/client";

interface CreateMessageThread {
    bot_id: string
    subject?: string
    email: string
    first_name: string
    last_name: string
    phone: string
}

interface GetChatbotRequestDto {
    botId: string
}

interface PostMessageRequestDto {
    message: string;
    bot_id: string;
    thread_id: string;
}

interface SubmitFeedbackDto {
    bot_id: string;
    message_id: string;
    feedback: string | null
}

interface PostMessageRequestDtoForTesting {
    questions: string[];
    bot_id: string;
    thread_id: string;
    k: number;
    custom_prompt: string;
    temperature: number;
    take: number;
}

export class WidgetController {
    async getChatbot({ botId }: GetChatbotRequestDto) {
        try {
            const chatbot = await prisma.chatBots.findFirst({
                where: {
                    BotID: botId,
                    IsActive: true
                }
            })

            if (!chatbot) {
                throw {
                    message: "Chatbot doesnt exist",
                    data: null,
                    statusCode: 400,
                }
            }

            return {
                data: {
                    theme_color: chatbot.ThemeColor,
                    bot_name: chatbot.BotName,
                    privacy_policy: chatbot.PrivacyPolicy
                }
            }

        } catch (error) {
            throw error;
        }
    }

    async createMessageThread(thread: CreateMessageThread) {
        try {

            const chatbot = await prisma.chatBots.findFirst({
                where: {
                    BotID: thread.bot_id
                }
            })
            if (!chatbot) {
                throw {
                    message: "Chatbot doesnt exist",
                    data: null,
                    statusCode: 400,
                }
            }

            const payload = {
                BotID: chatbot.BotID,
                Subject: null,
                Email: thread.email,
                FirstName: thread.first_name,
                LastName: thread.last_name,
                Phone: thread.phone
            }

            const messageThread = await prisma.messageThreads.create({
                data: payload
            });

            let initialMessage;
            //adds initial message in messages table.
            if (chatbot.InitialMessage) {
                const userPayload = {
                    ThreadID: messageThread.ThreadID,
                    Message: chatbot.InitialMessage,
                    SenderID: 0, // 1 - user, 0 - bot
                    ReceiverID: 1
                }
                initialMessage = await prisma.messages.create({
                    data: userPayload
                });
            }

            return {
                message: "Success",
                data: {
                    messageThread,
                    initialMessage: initialMessage
                },
            };

        } catch (err: any) {
            throw err;
        }
    }
    // stream message response and save it in the end

    // iteratorToStream(
    //     iterator: any,
    //     data: Prisma.MessagesUncheckedCreateInput) {
    //     let fullText = ''
    //     let i = 1;

    //     return new ReadableStream({
    //         async pull(controller) {
    //             const { value, done } = await iterator.next()
    //             console.log('streaming chunk ', i)
    //             i++
    //             if (done) {
    //                 controller.enqueue(JSON.stringify({
    //                     ...data,
    //                     Message: btoa(value?.content),
    //                     done: done
    //                 }))
    //                 controller.close()
    //                 const res = await prisma.messages.update({
    //                     where: {
    //                         MessageID: data.MessageID
    //                     },
    //                     data: {
    //                         Message: fullText
    //                     }
    //                 })
    //             } else {
    //                 controller.enqueue(JSON.stringify({
    //                     // ...data,
    //                     Message: btoa(value?.content),
    //                     done: done
    //                 }) + '␞');
    //                 fullText += value?.content
    //             }
    //         },
    //     })
    // }


    // stream message response and save it in the end
    iteratorToStream(
        iterator: any,
        data: Prisma.MessagesUncheckedCreateInput) {

        // helper to base64-encode UTF-8 safely in Node
        const base64EncodeUtf8 = (s?: string) => {
            // ensure s is string
            const str = s ?? "";
            return Buffer.from(str, "utf8").toString("base64");
        }

        let fullText = '';
        let i = 1;
        return new ReadableStream({
            async pull(controller) {
                try {
                    const { value, done } = await iterator.next();
                    console.log('streaming chunk ', i);
                    i++;

                    // make sure value?.content is handled safely
                    const chunkText = (value && value.content) ? value.content : '';

                    if (done) {
                        // on final chunk: send the last piece (if any) and mark done
                        controller.enqueue(JSON.stringify({
                            ...data,
                            Message: base64EncodeUtf8(chunkText),
                            done: true
                        }));
                        controller.close();

                        // persist the full (decoded) text in DB
                        await prisma.messages.update({
                            where: {
                                MessageID: data.MessageID
                            },
                            data: {
                                Message: fullText
                            }
                        });
                    } else {
                        // intermediate chunk(s) — send base64 encoded chunk and delimiter
                        controller.enqueue(JSON.stringify({
                            Message: base64EncodeUtf8(chunkText),
                            done: false
                        }) + '␞');
                        // accumulate the plain text for saving later
                        fullText += chunkText;
                    }
                } catch (err) {
                    // ensure we close the stream on error and rethrow/log
                    try { controller.error(err); } catch (e) { /* ignore */ }
                    throw err;
                }
            },
        });
    }


    async postMessage(data: PostMessageRequestDto, ip: string | null) {
        try {

            const messageThread = await prisma.messageThreads.findFirst({
                where: {
                    ThreadID: data.thread_id
                }
            });

            if (!messageThread) {
                throw {
                    message: "Message thread does not exist",
                    data: null,
                    statusCode: 400,
                }
            }

            const userPayload = {
                ThreadID: data.thread_id,
                Message: data.message,
                SenderID: 1, // 1 - user, 0 - bot
                ReceiverID: 0,
                Ip: ip || null,
            }

            await prisma.messages.create({
                data: userPayload
            });
            const chatbotController = new ChatbotController()
            const botResponse = await chatbotController.generateResponse(data.bot_id, data.thread_id, data.message)

            const botPayload: Prisma.MessagesUncheckedCreateInput = {
                ThreadID: data.thread_id,
                Message: '',
                SenderID: 0,
                ReceiverID: 1,
                SentDateTime: new Date().toISOString()
            }

            const res = await prisma.messages.create({
                data: botPayload
            })

            return this.iteratorToStream(botResponse, res)

        } catch (err: any) {
            throw err;
        }
    }

    async submitFeedback(feedback: SubmitFeedbackDto) {
        try {
            const message = await prisma.messages.findFirst({
                where: {
                    MessageID: feedback.message_id
                }
            });
            if (!message) {
                throw {
                    message: "Message does not exist",
                    data: null,
                    statusCode: 400,
                }
            }
            const res = await prisma.messages.update({
                where: {
                    MessageID: feedback.message_id,
                },
                data: {
                    Feedback: feedback.feedback
                }
            })
            return {
                message: "Success",
                data: {
                    message_id: res.MessageID,
                    feedback: res.Feedback
                },
            };
        }
        catch (err) {
            throw err
        }
    }

    //testing
    async postMessageForTesting(data: PostMessageRequestDtoForTesting) {
        try {

            const messageThread = await prisma.messageThreads.findFirst({
                where: {
                    ThreadID: data.thread_id
                }
            });

            if (!messageThread) {
                throw {
                    message: "Message thread does not exist",
                    data: null,
                    statusCode: 400,
                }
            }


            let chatResponse: {
                question: string;
                answer: string;
                context: {
                    CONTEXT: string;
                    URL: string
                }[];
            }[] = []

            for (const message of data.questions) {

                const userPayload = {
                    ThreadID: data.thread_id,
                    Message: message,
                    SenderID: 1, // 1 - user, 0 - bot
                    ReceiverID: 0,
                    Ip: null,
                }

                await prisma.messages.create({
                    data: userPayload
                });
                const chatbotController = new ChatbotController()
                const options = {
                    k: data.k,
                    temperature: data.temperature,
                    take: data.take
                }
                const { response, context } = await chatbotController.generateResponseForTesting(data.bot_id, data.thread_id, message, data.custom_prompt, options)

                const botPayload: Prisma.MessagesUncheckedCreateInput = {
                    ThreadID: data.thread_id,
                    Message: response,
                    SenderID: 0,
                    ReceiverID: 1,
                    SentDateTime: new Date().toISOString()
                }

                await prisma.messages.create({
                    data: botPayload
                });
                chatResponse.push({
                    question: message,
                    answer: response,
                    context
                })
            }

            return chatResponse
        } catch (err: any) {
            throw err;
        }
    }
}