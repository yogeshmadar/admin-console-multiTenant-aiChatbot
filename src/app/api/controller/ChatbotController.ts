import prisma from "@/lib/prisma";
import * as convert from 'xml-js';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import request from 'request';
import { Prisma } from "@prisma/client";

//
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from 'langchain/text_splitter';
import { OpenAIEmbeddings, ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts'
import util from 'util';
import { FILESYSTEM, REDIS, crawlDataStorageLocation } from "../constants/app.const";
import { createClient } from "redis";
import { RedisVectorStore, RedisVectorStoreFilterType } from "@langchain/redis";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from '@langchain/pinecone';

export interface Chatbot {
    bot_name: string;
    description: string;
    theme_color: string;
    html_node: string;
    sitemap_url: string;
    website_type: string;
    whitelist_domain: string;
    is_active: boolean;
    initial_message?: string;
    helpdesk_url?: string;
    privacy_policy?: string;
    initial_context?: string;
}

interface PromptTemplateProps {
    input: string;
    context: string;
    history?: string;
    helpdeskUrl: string | null;
    savedTemplate: string | null;
}

interface RagConfig {
    k: number;
    temperature: number;
    take: number;
    prompt: string;
}

export class ChatbotController {
    openaiEmbeddings: OpenAIEmbeddings;
    redisClient: any;
    pinecone: Pinecone;
    pineconeStore: PineconeStore;
    constructor() {
        this.openaiEmbeddings = new OpenAIEmbeddings({
            model: process.env.TEXT_EMBEDDING_MODEL,
            openAIApiKey: process.env.OPENAI_KEY,
        })

        // const client = this.redisClient = createClient({
        //     password: 'didiffi4XZoUpf5YKYNszf5yNNvxZ0KM',
        //     socket: {
        //         host: 'redis-16655.c244.us-east-1-2.ec2.redns.redis-cloud.com',
        //         port: 16655
        //     }
        // });
        // this.redisClient = client.connect();
        this.pinecone = new Pinecone({
            apiKey: process.env.PINECONE_KEY!
        });
        const pineconeIndex = this.pinecone.Index(process.env.PINECONE_INDEX!);
        this.pineconeStore = new PineconeStore(this.openaiEmbeddings, {
            pineconeIndex,
            maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
        });
    }

    async create(chatbot: Chatbot) {

        try {
            const chatbotNameExists = await prisma.chatBots.findFirst({
                where: {
                    BotName: chatbot.bot_name
                }
            })
            if (chatbotNameExists) {
                throw {
                    message: "Chatbot with this name already exists",
                    data: null,
                    statusCode: 400,
                }
            }
            const res = await prisma.chatBots.create({
                data: {
                    BotName: chatbot.bot_name,
                    Description: chatbot.description,
                    ThemeColor: chatbot.theme_color,
                    PrivacyPolicy: chatbot.privacy_policy,
                    SiteMapUrl: chatbot.sitemap_url,
                    WhitelistedDomain: chatbot.whitelist_domain,
                    IsActive: true,
                    InitialMessage: chatbot.initial_message,
                    HelpdeskUrl: chatbot.helpdesk_url,
                    InitialContext: chatbot.initial_context
                }
            });

            this.webScrapper(res.SiteMapUrl, res.BotID)

            return {
                message: "Successfully created chatbot",
                data: res,
                success: true
            };

        } catch (err: any) {
            throw err;
        }
    }

    async getAll() {
        try {

            const likesCount = await prisma.messages.groupBy({
                by: ['ThreadID'],
                where: {
                    Feedback: 'liked'
                },
                _count: {
                    Message: true
                }
            })

            const dislikesCount = await prisma.messages.groupBy({
                by: ['ThreadID'],
                where: {
                    Feedback: 'disliked'
                },
                _count: {
                    Message: true
                }
            })

            const chatbots = await prisma.chatBots.findMany({
                include: {
                    _count: {
                        select: {
                            MessageThreads: true
                        }
                    },
                    MessageThreads: {
                        select: {
                            ThreadID: true
                        }
                    }
                },
                orderBy: [{
                    IsActive: 'desc'
                }, {
                    UpdatedDateTime: 'desc',
                }],
            });

            const getLikesAndDislikesCount = (threads: {
                ThreadID: string
            }[]) => {

                const likesMessage = likesCount
                    .filter((lc) =>
                        threads.find((x) => x.ThreadID === lc.ThreadID)
                    )
                    .map((lc) => lc._count.Message);
                
                const likes = likesMessage.length ? 
                    likesMessage.reduce((sum, i) => {
                        return sum + i;
                    }) : 0;
                const dislikesMessage = dislikesCount
                    .filter((lc) =>
                        threads.find((x) => x.ThreadID === lc.ThreadID)
                    )
                    .map((lc) => lc._count.Message);

                const dislikes = dislikesMessage.length ?    
                    dislikesMessage.reduce((sum, i) => {
                        return sum + i;
                    }) : 0;

                return {
                    likes,
                    dislikes
                }
            }

            return {
                data: chatbots.map((chatbot) => ({
                    bot_id: chatbot.BotID,
                    bot_name: chatbot.BotName,
                    description: chatbot.Description,
                    theme_color: chatbot.ThemeColor,
                    privacy_policy: chatbot.PrivacyPolicy,
                    sitemap_url: chatbot.SiteMapUrl,
                    whitelist_domain: chatbot.WhitelistedDomain,
                    is_active: chatbot.IsActive,
                    created_datetime: chatbot.CreatedDateTime,
                    updated_datetime: chatbot.UpdatedDateTime,
                    thread_counts: chatbot._count.MessageThreads,
                    crawl_error: chatbot.CrawlErrors !== null,
                    ...getLikesAndDislikesCount(chatbot.MessageThreads)
                })),
            }

        } catch (error) {
            throw error;
        }
    }

    async get(botId: string) {
        try {
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
            return {
                message: "Successful",
                data: this.chatbotReturnResponse(chatbot),
            }
        } catch (error) {
            throw error;
        }
    }

    async update(chatbot: Chatbot, botId: string) {
        try {
            const chatbotExists = await prisma.chatBots.findUnique({
                where: {
                    BotID: botId,
                }
            })
            if (!chatbotExists) {
                throw {
                    message: "Chatbot doesnt exist",
                    data: null,
                    statusCode: 400,
                }
            }
            const chatbotNameExists = await prisma.chatBots.findFirst({
                where: {
                    BotName: {
                        equals: chatbot.bot_name,
                    },
                    BotID: {
                        not: botId,
                    },
                }
            })
            if (chatbotNameExists) {
                throw {
                    message: "Chatbot with this name already exists",
                    data: null,
                    statusCode: 400,
                }
            }
            const res = await prisma.chatBots.update({
                where: {
                    BotID: botId,
                },
                data: {
                    BotName: chatbot.bot_name,
                    Description: chatbot.description,
                    ThemeColor: chatbot.theme_color,
                    PrivacyPolicy: chatbot.privacy_policy,
                    SiteMapUrl: chatbot.sitemap_url,
                    WhitelistedDomain: chatbot.whitelist_domain,
                    IsActive: chatbot.is_active,
                    InitialMessage: chatbot.initial_message,
                    HelpdeskUrl: chatbot.helpdesk_url,
                    InitialContext: chatbot.initial_context
                }
            });

            return {
                message: "Success",
                data: this.chatbotReturnResponse(res),
            };

        } catch (err: any) {
            throw err;
        }
    }

    async delete(botId: string) {
        try {
            const chatbotExists = await prisma.chatBots.findUnique({
                where: {
                    BotID: botId
                }
            })
            if (!chatbotExists) {
                throw {
                    message: "Chatbot doesnt exist",
                    data: null,
                    statusCode: 400,
                }
            }

            const chatbot = await prisma.chatBots.update({
                where: {
                    BotID: botId,
                },
                data: {
                    IsActive: false
                }
            });

            return {
                message: `Chatbot deleted successfully`,
                data: {

                },
            };
        } catch (error) {
            throw error
        }
    }

    async crawlRefresh(botId: string) {
        try {
            const chatbot = await prisma.chatBots.findFirst({
                where: {
                    BotID: botId
                }
            })
            if (!chatbot) {
                throw {
                    message: "Chatbot doesnt exist",
                    data: null,
                    statusCode: 404,
                }
            }
            this.webScrapper(chatbot.SiteMapUrl, chatbot.BotID)

            return {
                message: "Sitemap is being refreshed",
                data: null,
                success: true
            };
        } catch (error) {
            throw error
        }
    }

    async logCrawlErrorsInDb(botId: string, errors: string | null) {
        console.log("logging error", errors)
        await prisma.chatBots.update({
            where: {
                BotID: botId
            },
            data: {
                CrawlErrors: errors
            }
        });
    }

    async webScrapper(siteMap: any, botId: string) {
        try {
            if (!siteMap.startsWith('http://') && !siteMap.startsWith('https://')) {
                siteMap = 'https://' + siteMap;
            }
            console.log(siteMap)
            const requestPromise = util.promisify(request);

            const xmlResponse = await requestPromise(siteMap);
            console.log(xmlResponse)
            
            const result = convert.xml2json(xmlResponse.body, { compact: true, spaces: 4 });
            console.log(result)
            const urls: string[] = JSON.parse(result).urlset.url.map((x: any) => x.loc._text);
            const dirName: string = `./crawloutput/${botId}`;
            const errors: any[] = [];
            console.log("Old Datas are being deleted from redis...")
            await this.deleteVectorsByNamespace(botId);
            console.log("Old Datas are deleted from redis...")
            if (fs.existsSync(dirName)) {
                fs.rmdirSync(dirName, { recursive: true });
            }
            if (crawlDataStorageLocation === FILESYSTEM) {
                fs.mkdirSync(dirName, { recursive: true });
            }

            for (let index = 0; index< urls.length; index++) {
                const url = urls[index];
                try {
                    const htmlResponse = await fetch(url)
                    const contentType = htmlResponse.headers.get('content-type');
                    if (htmlResponse.status === 200 && contentType?.includes('application/pdf')) {
                        const loader = new PDFLoader(await htmlResponse.blob()); //By default it uses the pdfjs build bundled with pdf-parse
                        const docs = await loader.load();
                        const text = docs.map((doc) => doc.pageContent.replace(/[\t]/g, ' ').replace(/(\n\s*){2,}/g, '\n')).join('\n')
                        if (crawlDataStorageLocation === REDIS) {
                            await this.pushToRedis(text, botId, { url, title: url }) // store URL as title for PDF chunks
                        }
                        if (crawlDataStorageLocation === FILESYSTEM) {
                            fs.writeFileSync(`${dirName}/${index}.json`, JSON.stringify({ url, title: url, body: text }), 'utf8');
                        }
                    }
                    else if (htmlResponse.status === 200) {
                        const html: string = await htmlResponse.text();
                        const $ = cheerio.load(html);
                        $('script').each((index, item) => {
                            $(item).remove();
                        });
                        $('style').each((index, item) => {
                            $(item).remove();
                        });
                        $('noscript').each((index, item) => {
                            $(item).remove();
                        });
                        const title = $('title').text();
                        const firstParagraph = $('body').text().replace(/[\t]/g, ' ').replace(/(\n\s*){2,}/g, '\n');
                        console.log(index);
                        console.log(title);
                        if (crawlDataStorageLocation === REDIS) {
                            await this.pushToRedis(firstParagraph, botId, { url, title })
                        }
                        if (crawlDataStorageLocation === FILESYSTEM) {
                            fs.writeFileSync(`${dirName}/${index}.json`, JSON.stringify({ url, title, body: firstParagraph }), 'utf8');
                        }
                    }
                } catch (error: any) {
                    errors.push({ url: url, error: error.message })
                    console.error(`Failed to fetch or process URL: ${url}`, error);
                }
            }
            console.log(errors)
            const logError = errors.length ? JSON.stringify(errors) : null
            this.logCrawlErrorsInDb(botId, logError);

            return {
                message: 'Successful!',
                data: null,
                success: true
            };
        } catch (err: any) {
            this.logCrawlErrorsInDb(botId, JSON.stringify(err.message));
            console.error('Error:', err);
        }
    }


    chatbotReturnResponse(chatbot: Prisma.ChatBotsGetPayload<{}>) {
        return {
            bot_id: chatbot.BotID,
            bot_name: chatbot.BotName,
            description: chatbot.Description,
            theme_color: chatbot.ThemeColor,
            privacy_policy: chatbot.PrivacyPolicy,
            sitemap_url: chatbot.SiteMapUrl,
            whitelist_domain: chatbot.WhitelistedDomain,
            is_active: chatbot.IsActive,
            created_datetime: chatbot.CreatedDateTime,
            updated_datetime: chatbot.UpdatedDateTime,
            initial_message: chatbot.InitialMessage,
            helpdesk_url: chatbot.HelpdeskUrl,
            crawl_error: chatbot.CrawlErrors,
            initial_context: chatbot.InitialContext
        }
    }

    async textSplitter(text: string, metadata: Record<string, any>, params?: Partial<RecursiveCharacterTextSplitterParams>) {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 4,
        })
        const documents = await splitter.createDocuments([text], [metadata])
        return documents;
    }

    async deleteVectorsByNamespace(namespace: string) {
        console.log("Attempting to delete all the vectors by botid...")
        try {
            // await new RedisVectorStore(this.openaiEmbeddings, {
            //     redisClient: await this.redisClient,
            //     indexName: namespace,
            // }).delete({
            //     deleteAll: true
            // });

            await this.pineconeStore.delete({
                deleteAll: true,
                namespace
            })
        }
        catch (error: any) {
            console.log("Failed to delete data from redis")
        }
    }

    async pushToRedis(texts: string, botId: string, metadata: Record<string, any>) {
        try {
            const documents = await this.textSplitter(texts, metadata);
            // await RedisVectorStore.fromDocuments(documents, this.openaiEmbeddings, {
            //     redisClient: await this.redisClient,
            //     indexName: botId,
            // });

            const pineconeIndex = this.pinecone.Index(process.env.PINECONE_INDEX!);
            await PineconeStore.fromDocuments(documents, this.openaiEmbeddings, {
                namespace: botId,
                pineconeIndex,
                maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
            });
            return {
                message: 'successful'
            }
        } catch (error) {
            throw {
                message: error
            }
        }
    }

    async queryRedis(question: string, botId: string, k: number = 3) {
        // const vectorStore = new RedisVectorStore(this.openaiEmbeddings, {
        //     redisClient: await this.redisClient,
        //     indexName: botId.toLowerCase(),
        // });

        const pineconeIndex = this.pinecone.Index(process.env.PINECONE_INDEX!);
        const vectorStore = await PineconeStore.fromExistingIndex(
            this.openaiEmbeddings,
            { pineconeIndex, namespace: botId.toLowerCase() }
        );
        console.log(vectorStore)
        const result = await vectorStore.similaritySearch(question, k);
        return result;
    }

    async setRagConfig(config: RagConfig) {
        const dirName = `./rag-config.json`
        fs.writeFileSync(dirName, JSON.stringify(config, null, 2))
        // await (await this.redisClient).set('rag-config', JSON.stringify(config))
        return {
            message: 'success'
        }
    }

    async getRagConfig(): Promise<RagConfig> {
        const dirName = `./rag-config.json`
        // const config = await (await this.redisClient).get('rag-config');
        // if (!config) {
            const storedConfig = fs.readFileSync(dirName, 'utf8')
            // await (await this.redisClient).set('rag-config', storedConfig)
            const parsedConfig = JSON.parse(storedConfig)
            return parsedConfig
        // }
        // return JSON.parse(config)
    }

    async promptTemplate({ input, helpdeskUrl, history, context, savedTemplate }: PromptTemplateProps) {
        const config = await this.getRagConfig();
        const prompt = new PromptTemplate({
            inputVariables: ['context', 'input', 'history', 'helpdeskUrl'],
            template: (savedTemplate && savedTemplate !== "") ? savedTemplate : config.prompt
        })
        return prompt.format({ input, context, history, helpdeskUrl });
    }

    async generateResponse(botId: string, threadId: string, input: string) {
        const ragConfig = await this.getRagConfig();
        const previousMsgs = await prisma.messages.findMany({
            where: {
                ThreadID: threadId
            },
            orderBy: {
                SentDateTime: 'desc'
            },
            take: ragConfig.take
        })
        const chatbot = await prisma.chatBots.findFirst({
            where: {
                BotID: botId
            }
        })
        if (!chatbot) {
            throw {
                message: "Chatbot doesnt exist",
                data: null,
                statusCode: 404,
            }
        }
        const savedTemplate = chatbot?.CustomPrompt;
        //Fetches last 10 conversations
        const conversations = previousMsgs.map(msg => {
            return msg.SenderID === 1 ?
                `HUMAN: ${msg.Message}` : `YOU: ${msg.Message}`
        }).reverse().join('\n');
        // const inputMsgs = previousMsgs.map(msg => {
        //     return msg.SenderID === 1 ?
        //         new HumanMessage(msg.Message) : new AIMessage(msg.Message)
        // }).reverse();
        const documents = await this.queryRedis(input.concat(chatbot.InitialContext ?? ''), botId, ragConfig.k)
        const context = documents.map((doc, i) => {
            return `
            CONTEXT ${i + 1}: ${doc.pageContent}
            URL: ${doc.metadata.url}
            `
        }).join('\n\n')

        const prompt = await this.promptTemplate({
            input,
            context: context,
            history: conversations,
            helpdeskUrl: chatbot?.HelpdeskUrl,
            savedTemplate
        })
        const llm = new ChatOpenAI({
            streaming: true,
            apiKey: process.env.OPENAI_KEY,
            model: process.env.OPENAI_MODEL,
            temperature: ragConfig.temperature ?? 0.8
        });
        const response = await llm.stream(prompt)
        return response;
    }

    // Testing 

    async generateResponseForTesting(botId: string, threadId: string, input: string, customPrompt: string, options: any) {
        const previousMsgs = await prisma.messages.findMany({
            where: {
                ThreadID: threadId
            },
            orderBy: {
                SentDateTime: 'desc'
            },
            take: options.take ?? 10
        })
        const chatbot = await prisma.chatBots.findFirst({
            where: {
                BotID: botId
            }
        })
        if (!chatbot) {
            throw {
                message: "Chatbot doesnt exist",
                data: null,
                statusCode: 404,
            }
        }
        //Fetches last 10 conversations
        const conversations = previousMsgs.map(msg => {
            return msg.SenderID === 1 ?
                `HUMAN: ${msg.Message}` : `YOU: ${msg.Message}`
        }).reverse().join('\n');
        const documents = await this.queryRedis(input, botId, options?.k)
        const context = documents.map((doc, i) => {
            return `
            CONTEXT ${i + 1}: ${doc.pageContent}
            URL: ${doc.metadata.url}
            `
        }).join('\n\n')

        const contextForResponse = documents?.map((doc, i) => {
            return {
                CONTEXT: doc.pageContent,
                URL: doc.metadata.url
            }
        })
        const prompt = await this.promptTemplate({ input, context, history: conversations, helpdeskUrl: chatbot?.HelpdeskUrl, savedTemplate: customPrompt })
        const llm = new ChatOpenAI({
            streaming: true,
            apiKey: process.env.OPENAI_KEY,
            model: "gpt-4-turbo-preview",
            temperature: options?.temperature ?? 0.8
        });

        const res = await llm.invoke(prompt);
        const response: string = res.lc_kwargs.content
        return {
            response,
            context: contextForResponse
        }
    }
}


