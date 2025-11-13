
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function middleware(req: NextRequest) {
   const next_auth_session = await getToken({ req });
   var path = req.nextUrl.pathname;
   const isPublic = path == "/sign-in";

   const excludeList = [
      '/api/widgets',
      "/api/auth",
      'api/chatbots/update-rag-config'
   ]

   // No need to validate api/auth and api/widgets. 
   // NOTE: api/widgets apis are used in chatbot application 
   if(excludeList.find(a => req.url.includes(a))){
      return NextResponse.next();
   }
   if (req.url.includes('/api')) {
      return NextResponse.next();
      if (next_auth_session) {
      }
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
   }else{
      if(isPublic && next_auth_session){
         if(isPublic){
            return NextResponse.redirect(new URL("/chatbots", req.url));
         }
          return NextResponse.json({message: "Unauthorized"},{status: 401}); 
      }
      if(!isPublic && !next_auth_session){
         return NextResponse.redirect(new URL('/sign-in',req.url));
      }
   }
}

   export const config = {
      matcher: [
         "/sign-in",
         "/chatbots/:path*",
         "/message_threads/:path*",
         "/admin_users",
         "/api/:path*"
      ]
   }
