import { MessagesController } from "@/app/api/controller/MessagesController";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    botid: string;
    threadid: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const message = await new MessagesController().getAllByBotAndThreadId(params.botid!, params.threadid!);
        return NextResponse.json(message, { status: 200 });

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