import { IsEnum } from 'class-validator';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class UpdateRoleDto {
  @IsEnum(Role, { message: 'Rol inválido. Debe ser USER o ADMIN' })
  role: Role;
}
