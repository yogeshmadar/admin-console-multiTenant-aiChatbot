import * as bcrypt from "bcrypt";
import { UsersValidator } from "../validators/UserSchema";
import { StaticMessage } from "../constants/StaticMessages";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import nodemailer from 'nodemailer'
import Handlebars from 'handlebars'
import generator from 'generate-password'
import { GetManyDto } from "../dto/getmany-dto";

interface UserDetails {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
}

interface EmailDto {
  name: string;
  email: string;
  password: string;
}

export class UserController {
  async createUser(user: UserDetails) {
    try {
      await new UsersValidator().userSchemaCreate(user, "create");
      const email = await prisma.users.findFirst({
        where: {
          Email: user.email,
          IsActive: true,
        },
      });
      if (email) {
        throw {
          message: StaticMessage.ExistEmail,
          data: null,
          statusCode: 400,
        };
      }

      var password = generator.generate({
        length: 12,
        numbers: true,
        symbols: true,
      });

      await prisma.$transaction(async (tx) => {
        const savedUser = await tx.users.create({
          data: {
            FirstName: user.first_name,
            LastName: user.last_name || "",
            Email: user.email,
            PasswordHash: password
          },
        });
        // const emailStatus = await this.sendEmail({
        //   name: savedUser.FirstName,
        //   email: savedUser.Email,
        //   password: password
        // })

        // console.log(emailStatus)
        // console.log(emailStatus?.accepted?.some(e => e === savedUser.Email))
        // if (!emailStatus?.accepted?.some(e => e === savedUser.Email)) {
        //   throw "Failed to create user"
        // }
        return savedUser
      }, { timeout: 20000 })

      // const { PasswordHash, ...result } = savedUser;
      return {
        message: StaticMessage.SuccessfullyRegister,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateUser(user: UserDetails, userId: string) {
    try {
      await new UsersValidator().userSchemaCreate(user, "update");
      const userExists = await prisma.users.findFirst({
        where: {
          UserID: userId,
        },
      });
      if (!userExists) {
        throw {
          message: "User does not exist",
          data: null,
          statusCode: 400,
        };
      }
      const email = await prisma.users.findFirst({
        where: {
          Email: user.email,
          IsActive: true,
        },
      });
      if (email && email.UserID !== userId) {
        throw {
          message: StaticMessage.ExistEmail,
          data: null,
          statusCode: 400,
        };
      }
      const savedUser = await prisma.users.update({
        where: {
          UserID: userId,
        },
        data: {
          FirstName: user.first_name,
          LastName: user.last_name || "",
          Email: user.email
        },
      });
      const { PasswordHash, ...result } = savedUser;
      return {
        message: "Successfully updated user",
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async activateDeactivateUser(body: any, userId: string) {
    try {
      await new UsersValidator().UpdateUser(body);
      const existingUser = await prisma.users.findUnique({
        where: {
          UserID: userId,
        },
      });

      if (!existingUser) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      const { is_active } = body;
      await prisma.users.update({
        data: {
          IsActive: is_active,
        },
        where: {
          UserID: userId,
        },
      });

      const message = is_active ? "enabled" : "disabled";

      return {
        message: `User ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUsers() {
    try {
      const users = await prisma.users.findMany();
      return {
        users: users.map((user) => {
          return {
            user_id: user.UserID,
            first_name: user.FirstName,
            last_name: user.LastName,
            email: user.Email,
            is_active: user.IsActive,
            created_date: user.CreatedDate,
          };
        }),
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUsersPaginated(dto: GetManyDto) {
    try {
      console.log(dto)
      const page = dto.page ? Number(dto.page) : 1;
        const take = dto.limit ? Number(dto.limit) : 10;
        const skip = page === 1 ? 0 : (page - 1) * take;
      const users = await prisma.users.findMany({
        skip,
        take
      });
      const totalCount = await prisma.users.count()
      return {
        users: users.map((user) => {
          return {
            user_id: user.UserID,
            first_name: user.FirstName,
            last_name: user.LastName,
            email: user.Email,
            is_active: user.IsActive,
            created_date: user.CreatedDate,
          };
        }),
        total_count: totalCount,
        no_of_pages: Math.ceil(totalCount / Number(dto.limit))
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUser(userId: string) {
    try {
      const user = await prisma.users.findFirst({
        where: {
          UserID: userId,
        },
      });
      if (!user) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }
      return {
        users: this.userReturnResponse(user)
      };
    } catch (err: any) {
      throw err;
    }
  }

  async sendEmail({ name, email, password }: EmailDto) {
    try {
      const source = this.emailTemplate()
      const template = Handlebars.compile(source);
      const emailBody = template({ name, email, password })
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM_ADDRESS,
        to: email,
        subject: "Welcome to Chatbot Admin Console",
        html: emailBody
      });
      return info
    } catch (error) {
      console.log(error);
      console.log("Failed to send email for user :", email)
    }
  }

  userReturnResponse(user: Prisma.UsersGetPayload<{}>) {
    return {
      user_id: user.UserID,
      first_name: user.FirstName,
      last_name: user.LastName,
      email: user.Email,
      is_active: user.IsActive,
      created_date: user.CreatedDate,
    };
  }


  emailTemplate() {
    const template = `<h1 style="color: white; background: purple; text-align: center; padding: 30px 0px;">Welcome</h1>
    <h5>Dear {{name}},</h5>
    <p style="color: grey;">Account has been created on behalf of you. Please use below credential to login to your account</p>
    <table style="border-collapse: collapse; width: 28.2544%; height: 43.5px;" border="1"><colgroup><col style="width: 50.037%;"><col style="width: 50.037%;"></colgroup>
    <tbody>
    <tr style="height: 21.5px;">
    <td>Username</td>
    <td>{{email}}</td>
    </tr>
    <tr style="height: 22px;">
    <td>Password</td>
    <td>{{password}}</td>
    </tr>
    </tbody>
    </table>`
    return template;
  }
}
