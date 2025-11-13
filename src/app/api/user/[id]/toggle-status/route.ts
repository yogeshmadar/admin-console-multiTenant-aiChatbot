import { UserController } from "@/app/api/controller/UserController";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = params.id
        const body: any = await request.json();
        const result = await new UserController().activateDeactivateUser(body, userId!);
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