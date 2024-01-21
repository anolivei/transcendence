import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoginController } from './login/login.controller';
import { FriendsController } from './friends/friends.controller';
import { LoginService } from './login/login.service';
import { FriendsService } from './friends/friends.service';
import { TwoFactorAutenticateService } from './two-factor-autenticate/two-factor-autenticate.service';
import { LoginModule } from './login/login.module';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';

const secretJwt = process.env.SECRET_JWT;

@Module({
  imports: [
    LoginModule,
    UsersModule,
    JwtModule.register({
      secret: secretJwt,
      signOptions: { expiresIn: '1h' },
    }),
    FriendsModule,
  ],
  controllers: [LoginController, FriendsController],
  providers: [LoginService, TwoFactorAutenticateService, FriendsService],
})
export class AppModule {}
