import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { User } from '../auth/decorators/user.decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateRoleDto } from '../auth/dto/update-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
   return this.usersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @User() user: any,
    ) {
    if (user.userId !== id && user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permiso para modificar este usuario');
    }

    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ) {
    if (user.userId !== id && user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permiso para eliminar este usuario');
    }

    return this.usersService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @User('userId') requesterId: number, // quien hace la petición
  ) {
    if (requesterId === id) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }

    return this.usersService.updateRole(id, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@User('userId') userId: number) {
    return this.usersService.findById(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

}
