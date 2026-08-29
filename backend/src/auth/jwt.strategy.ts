import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'school-management-secret',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: Role;
    teacherId?: number;
    studentId?: number;
    parentId?: number;
  }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,

      ...(payload.teacherId !== undefined
        ? { teacherId: payload.teacherId }
        : {}),

      ...(payload.studentId !== undefined
        ? { studentId: payload.studentId }
        : {}),

      ...(payload.parentId !== undefined
        ? { parentId: payload.parentId }
        : {}),
    };
  }
}
