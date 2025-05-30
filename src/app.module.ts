import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule],
  providers:[RolesGuard]
})
export class AppModule {}
