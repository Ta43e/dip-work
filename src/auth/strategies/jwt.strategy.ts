import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'entity/some.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({ where: { id: payload.id } });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const isStatusMatch = user.statusProfile === payload.status;
    const isRoleMatch = user.role === payload.role;
    const isTelegramMatch =
      (user.telegramId ?? null) === (payload.telegramId ?? null);

    if (!isStatusMatch || !isRoleMatch || !isTelegramMatch) {
      throw new UnauthorizedException('Токен устарел, авторизуйтесь заново');
    }
    
    return { id: payload.id, role: payload.role, status: payload.status, telegramId: user.telegramId };
  }
}
