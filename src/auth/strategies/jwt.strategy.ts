import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'entity/some.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(    @InjectRepository(Users) 
  private readonly userRepository: Repository<Users>,) {
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

    // Проверяем, не изменился ли статус или роль
    if (user.statusProfile !== payload.status || user.role !== payload.role) {
      throw new UnauthorizedException('Токен устарел, авторизуйтесь заново');
    }

    return { id: payload.id, role: payload.role, status: payload.status };
  }
}
