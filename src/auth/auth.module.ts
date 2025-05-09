import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { JwtModule } from "@nestjs/jwt";
import { MailService } from "./mail.service";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { JwtStrategy } from "./jwt.strategy";
import { AdminGuard } from "./guards/admin.guard";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'texnosardor',
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    AccessTokenGuard,
    JwtStrategy,
    AdminGuard,
  ],
  exports: [JwtStrategy, AccessTokenGuard, AdminGuard, AuthService],
})
export class AuthModule {}
