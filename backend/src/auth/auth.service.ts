import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        teacher: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    /**
     * --------------------------------------------------
     * ROLE-SPECIFIC PROFILE IDs
     * --------------------------------------------------
     *
     * User.id is a String.
     *
     * Attendance tables use:
     * - teacherId -> Teacher.id
     * - studentId -> Student.id
     * - parentId  -> Parent.id
     *
     * Therefore we resolve the actual profile ID
     * according to the logged-in user's role.
     */

    let teacherId: number | undefined;
    let studentId: number | undefined;
    let parentId: number | undefined;

    /**
     * TEACHER
     */
    if (user.role === Role.TEACHER) {
      if (!user.teacher) {
        throw new UnauthorizedException(
          'Teacher profile not found.',
        );
      }

      teacherId = user.teacher.id;
    }

    /**
     * STUDENT
     *
     * Student already has a unique email field,
     * so we resolve the Student record using
     * the same login email.
     */
    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: {
          email: user.email,
        },
        select: {
          id: true,
        },
      });

      if (!student) {
        throw new UnauthorizedException(
          'Student profile not found.',
        );
      }

      studentId = student.id;
    }

    /**
     * PARENT
     *
     * Parent.email is nullable but unique.
     * Since login is already successful through
     * User.email, we resolve the matching Parent
     * using that email.
     */
    if (user.role === Role.PARENT) {
      const parent = await this.prisma.parent.findUnique({
        where: {
          email: user.email,
        },
        select: {
          id: true,
        },
      });

      if (!parent) {
        throw new UnauthorizedException(
          'Parent profile not found.',
        );
      }

      parentId = parent.id;
    }

    /**
     * --------------------------------------------------
     * JWT PAYLOAD
     * --------------------------------------------------
     *
     * sub      = User.id
     * teacherId = Teacher.id (TEACHER only)
     * studentId = Student.id (STUDENT only)
     * parentId  = Parent.id  (PARENT only)
     */
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,

      ...(teacherId !== undefined
        ? { teacherId }
        : {}),

      ...(studentId !== undefined
        ? { studentId }
        : {}),

      ...(parentId !== undefined
        ? { parentId }
        : {}),
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,

        ...(teacherId !== undefined
          ? { teacherId }
          : {}),

        ...(studentId !== undefined
          ? { studentId }
          : {}),

        ...(parentId !== undefined
          ? { parentId }
          : {}),
      },
    };
  }
}