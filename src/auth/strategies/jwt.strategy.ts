import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    const secret = process.env.JWT_SECRET || 'your_secret_key';
    console.log('[JWT Strategy] Inicializando com secret de comprimento:', secret.length);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('[JWT.validate] Iniciado com payload:', JSON.stringify(payload));

    try {
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        console.log('[JWT.validate] Usuário não encontrado para ID:', payload.sub);
        throw new UnauthorizedException('User not found');
      }

      console.log('[JWT.validate] Usuário validado:', user.id, user.email);
      return user;
    } catch (error) {
      console.error('[JWT.validate] Erro ao validar token:', error.message);
      throw error;
    }
  }
}
