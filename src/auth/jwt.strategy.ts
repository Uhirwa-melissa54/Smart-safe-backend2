import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtUser = {
  id: number;
  firstName?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'access-token',
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    const sub = payload?.sub;
    if (typeof sub !== 'number') {
      throw new UnauthorizedException('Invalid token');
    }
    return { id: sub, firstName: payload?.firstName };
  }
}

