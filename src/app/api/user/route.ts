import { NextRequest, NextResponse } from "next/server";
import { UserController } from "../controller/UserController";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
    try {
      const body: any = await request.json();
      const result = await new UserController().createUser(body);
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
