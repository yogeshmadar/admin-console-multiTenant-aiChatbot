
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export const getDomain = (req: NextRequest) => {
    const url = req.headers.get("Origin")
    return new URL(url!)
}

export const validateDomain = async (req: NextRequest, botId: string) => {
    if(!botId) {
        throw {
            message: "Invalid/No botId found",
            data: null,
            statusCode: 400,
        }
    }
    const chatbot = await prisma.chatBots.findFirst({
        where: {
            BotID: botId
        }
    });
    if (!chatbot) {
        throw {
            message: "Chatbot doesnt exist",
            data: null,
            statusCode: 400,
        }
    }
    const domain = getDomain(req);
    console.log(domain, chatbot.WhitelistedDomain)
    if (domain.host !== chatbot.WhitelistedDomain && domain.origin !== chatbot.WhitelistedDomain) {
        throw {
            message: "Domain does not match",
            data: null,
            statusCode: 400,
        }
    }
    return chatbot.WhitelistedDomain;
}