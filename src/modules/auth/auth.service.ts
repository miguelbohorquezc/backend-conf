import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService,private jwtService: JwtService,) {}

  async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const passwordMatches = await bcrypt.compare(dto.password, user.password);
  if (!passwordMatches) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const payload = { sub: user.id, role: user.role };
  const token = this.jwtService.sign(payload);

  return {
    access_token: token,
  };
  }

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const data: any = {
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: 'USER',
    };

    if (dto.phone) {
      data.phone = dto.phone;
    }

    const user = await this.prisma.user.create({ data });

    // Forma segura de excluir la contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
