import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RBACInitializer } from './rbac/rbac.init';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/auth-service',
    ),

    AuthModule,
    UsersModule,
    RolesModule,
  ],

  controllers: [AppController],

  providers: [AppService, RBACInitializer],
})
export class AppModule {
  constructor(private readonly rbacInit: RBACInitializer) {}

  async onModuleInit() {
//    await this.rbacInit.initialize();
  }
}
