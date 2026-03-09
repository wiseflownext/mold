import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('账号或密码错误');
    }
    if (user.status === 0) {
      throw new UnauthorizedException('账号已禁用');
    }
    const payload = { sub: user.id, username: user.username, role: user.role.code };
    return {
      token: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role.name,
        roleCode: user.role.code,
        appMode: user.role.appMode,
      },
    };
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}
