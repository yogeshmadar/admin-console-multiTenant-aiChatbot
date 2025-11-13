import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { UserController } from "../../controller/UserController";

export async function POST(request: NextRequest) {
    try {
      const jwt: any = await getToken({ req: request });
      const userId = jwt?.data.user_info.id;
      const body = await request.json()
      const result = await new UserController().getUsersPaginated(body);
      return NextResponse.json(result, { status: 200 });
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