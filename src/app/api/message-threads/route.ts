import { NextRequest, NextResponse } from "next/server";
import { MessageThreadsController } from "../controller/MessageThreadsController";



export async function GET(request: NextRequest) {
    try {
        const chatbot = await new MessageThreadsController().getAll();
        return NextResponse.json(chatbot, { status: 200 });

    } catch (err: any) {
        if (err.statusCode === 422) {
            return NextResponse.json(
                { message: err.data[0] },
                { status: err.statusCode }
            );
        } else if (err.statusCode) {
            return NextResponse.json(
                { message: err.message, data: err.data },
                { status: err.statusCode }
            );
        } else {
            return NextResponse.json({ message: err.message }, { status: 500 });
        }
    }
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const messageThreads = await new MessageThreadsController().getAllPaginated(body);
        return NextResponse.json(messageThreads, { status: 200 });

    } catch (err: any) {
        if (err.statusCode === 422) {
            return NextResponse.json(
                { message: err.data[0] },
                { status: err.statusCode }
            );
        } else if (err.statusCode) {
            return NextResponse.json(
                { message: err.message, data: err.data },
                { status: err.statusCode }
            );
        } else {
            return NextResponse.json({ message: err.message }, { status: 500 });
        }
    }
}


