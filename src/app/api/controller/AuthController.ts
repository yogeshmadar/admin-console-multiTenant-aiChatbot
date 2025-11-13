import { UsersValidator } from "../validators/UserSchema";
import { comparePassword } from "../validators/PasswordValidator";
import { signJwtAccessToken } from "@/lib/jwt";
import { StaticMessage } from "../constants/StaticMessages";
import prisma from "@/lib/prisma";


interface SignInRequestBody {
  email: string;
  password: string;
}

export class AuthController {

  async SignIn(body: SignInRequestBody) {
    try {
      await new UsersValidator().userSchemaSignIn(body, "signin");
      const user = await prisma.users.findFirst({
        where: {
          Email: body.email,
          IsActive: true,
        },
      });
      if (user === null) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      if (user.PasswordHash === null) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.NoPasswordUser,
        };
      }

      // let isMatching = await comparePassword(
      //   body.password,
      //   user.PasswordHash!
      // );
      console.log(body.password + " " + user.PasswordHash)
      if (body.password != user.PasswordHash) {
        throw {
          statusCode: 401,
          data: null,
          message: StaticMessage.InvalidPassword,
        };
      }

      const { PasswordHash, ...userWithoutPass } = user;
      const accessToken = await signJwtAccessToken(userWithoutPass);
      const result = {
        user_info: userWithoutPass,
        auth_info: accessToken,
      };

      return {
        message: StaticMessage.LoginSuccessful,
        data: result,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
