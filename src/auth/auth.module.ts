import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { JwtModule } from "@nestjs/jwt";
import { MailService } from "./mail.service";
import { ConfigModule } from "@nestjs/config";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY, 
      signOptions: { expiresIn: "60s" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, AccessTokenGuard, JwtStrategy], 
})
export class AuthModule {}
