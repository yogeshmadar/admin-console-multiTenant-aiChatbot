import { ChatbotController } from "@/app/api/controller/ChatbotController";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const apikey = request.headers.get('apiKey')
        if(apikey !== 'M99UIDAQlM9IKxcFbMusScTWP1hk8TkGRQkFgwTKNsfji1AphTSbU7eZuDfR6zKq') {
            throw {
                statusCode: 401,
                data: null,
                message: 'Not allowed',
            };
        }
        const body = await request.json()
        const result = await new ChatbotController().setRagConfig(body);
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