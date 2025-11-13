import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";
import { WidgetController } from "../../controller/WidgetController";
import { validateDomain } from "../../validators/domainValidator";

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const body: any = await request.json();
        await validateDomain(request, body.bot_id)
        const result = await new WidgetController().submitFeedback(body);
        return NextResponse.json(result)
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