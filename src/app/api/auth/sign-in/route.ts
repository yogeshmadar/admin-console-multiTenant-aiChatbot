import { NextResponse } from "next/server";
import { AuthController } from "../../controller/AuthController";

interface SignInRequestBody {
  email: string;
  password: string;
}
export async function POST(request: Request) {

  const body: SignInRequestBody = await request.json();
  console.log(body)
  try {
    const result = await new AuthController().SignIn(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err.statusCode === 422) {
      return NextResponse.json(
        { message: err.message, data: err.data },
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
