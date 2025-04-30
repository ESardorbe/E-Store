import { UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import  { JwtPayload } from "./jwt-payload.interface"
import { InjectModel } from "@nestjs/mongoose"
import  { Model } from "mongoose"
import { User,  UserDocument } from "./schemas/user.schema"

export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    })
  }

  async validate(payload: JwtPayload) {
    const { sub } = payload

    const user = await this.userModel.findById(sub).exec()

    if (!user || user.isLogOut) {
      throw new UnauthorizedException("Please log in to access this resource")
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      isVerify: payload.isVerify,
    }
  }
}
