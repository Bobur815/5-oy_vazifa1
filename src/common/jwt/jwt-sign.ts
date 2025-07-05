import { JwtSignOptions } from "@nestjs/jwt";

export const JwtAccessToken: JwtSignOptions = {
    secret:"olma",
    expiresIn:'1d'
}
export const JwtRefreshToken: JwtSignOptions = {
    secret:"olmaaaa",
    expiresIn:'30d'
}