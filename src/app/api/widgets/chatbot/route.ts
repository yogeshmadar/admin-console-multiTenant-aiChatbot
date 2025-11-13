import { NextRequest, NextResponse } from "next/server";
import { WidgetController } from "../../controller/WidgetController";
import { validateDomain } from "../../validators/domainValidator";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        await validateDomain(request, body.botId)
        const chatbot = await new WidgetController().getChatbot(body!);
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