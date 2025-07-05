import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt, StrategyOptions} from 'passport-jwt'
import { JwtAccessToken } from "./jwt-sign";
import { PrismaService } from "src/core/database/prisma.service";

export interface JwtPayload {
    id:string,
    email:string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtAccessToken.secret!,
    };
    super(options);
  }

    async validate(payload:JwtPayload){
        const user = await this.prisma.user.findUnique({where:{id:payload.id}})
        if (!user) {
            throw new UnauthorizedException();
        }

        return { id: payload.id, username: payload.email,};
    }
}