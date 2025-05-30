import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ---------------- LOGIN ----------------

  describe('login', () => {
    it('debería retornar un JWT si credenciales son válidas', async () => {
      const user = {
        id: 1,
        email: 'test@mail.com',
        password: await bcrypt.hash('1234', 10),
        role: 'USER',
      };
      prisma.user.findUnique.mockResolvedValue(user);
      jwt.sign.mockReturnValue('fake-jwt');

      const result = await service.login({ email: user.email, password: '1234' });

      expect(result).toEqual({ access_token: 'fake-jwt' });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: user.id, role: user.role });
    });

    it('debería lanzar Unauthorized si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@existe.com', password: '1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar Unauthorized si la contraseña es incorrecta', async () => {
      const user = {
        id: 1,
        email: 'test@mail.com',
        password: await bcrypt.hash('1234', 10),
        role: 'USER',
      };
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(
        service.login({ email: user.email, password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------- REGISTER ----------------

  describe('register', () => {
    it('debería registrar un nuevo usuario si el email no existe', async () => {
      const dto = { email: 'nuevo@mail.com', name: 'Nuevo', password: '1234' };
      prisma.user.findUnique.mockResolvedValue(null); // Usuario no existe

      const fakeUser = {
        id: 1,
        email: dto.email,
        name: dto.name,
        password: 'hashed-pass',
        role: 'USER',
      };

      prisma.user.create.mockResolvedValue(fakeUser); // Simula creación exitosa

      const result = await service.register(dto);

      expect(result).toMatchObject({
        id: 1,
        email: dto.email,
        name: dto.name,
        role: 'USER',
      });

      expect(result).not.toHaveProperty('password'); // Confirmamos que no se devuelve la contraseña
    });

    it('debería lanzar ConflictException si el email ya está registrado', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 }); // Usuario ya existe

      await expect(
        service.register({ email: 'ya@mail.com', name: 'Test', password: '1234' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
