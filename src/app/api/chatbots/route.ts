import { NextRequest, NextResponse } from "next/server";

import { ChatbotController } from "../controller/ChatbotController";


export async function GET(request: NextRequest) {
    try {
        const chatbots = await new ChatbotController().getAll();
        return NextResponse.json(chatbots, { status: 200 });
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
        const body: any = await request.json();
        const result = await new ChatbotController().create(body);
        return NextResponse.json(result, {
            status: 200,
        });
    } catch (error: any) {
        if (error.statusCode == 422) {
            return NextResponse.json(
                { message: error.data[0] },
                { status: error.statusCode }
            );
        } else if (error.statusCode) {
            return NextResponse.json(
                { message: error.message, data: error.data },
                { status: error.statusCode }
            );
        } else {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    }
}

