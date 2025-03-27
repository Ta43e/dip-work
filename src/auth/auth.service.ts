import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'modules/user/user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'entity/some.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(JwtService) private readonly jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email); 
    if (!user) {
      return null; 
    }

    const passwordIsMatch = await argon2.verify(user.hashPassword, pass);
    if (!passwordIsMatch) {
      return null;
    }

    const { hashPassword, ...result } = user;
    return result;
  }

  async login(user: Users) {
    const payload = { id: user.id, role: user.role, status: user.statusProfile };
    return {
        id: user.id,
        role: user.role,
        access_token: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET }),
      };
  }
}
