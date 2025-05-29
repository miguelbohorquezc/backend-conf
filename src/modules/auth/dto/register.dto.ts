import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsOptional()
  phone?: string;
}
