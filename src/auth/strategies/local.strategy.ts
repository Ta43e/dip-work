import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AuthService) private authService: AuthService) {
    super({ usernameField: "email" });
  }

  async validate(email: string, pass: string): Promise<any> {

    const user = await this.authService.validateUser(email, pass);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return user;
  }
}
