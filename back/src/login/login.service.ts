import {
  Injectable,
  Response,
  Body,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TwoFactorAutenticateService } from '../two-factor-autenticate/two-factor-autenticate.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly twoFactorAutenticateService: TwoFactorAutenticateService,
  ) {}

  async getToken(authorizationCode: string): Promise<string> {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;
    Logger.log('Client' + clientId);

    try {
      const formData = new FormData();
      formData.append('grant_type', 'authorization_code');
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);
      formData.append('code', authorizationCode);
      formData.append('redirect_uri', redirectUri);
      const response = await axios.post(process.env.INTRA_URL_TOKEN, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      if (response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('Access token not found in the response.');
      }
    } catch (error) {
      throw new Error(
        `Error retrieving access token ${authorizationCode}: ${error.message}`,
      );
    }
  }

  async getInfo(token: string): Promise<any> {
    try {
      Logger.log('token ' + token);
      return await axios.get(process.env.INTRA_URL_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      Logger.error('Error making the request:', error.message);
      throw error;
    }
  }

  async insertToken(profile: any, @Response() res, action: string) {
    const expiresAt = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);
    const payload = {
      id: profile.user_id,
      login: profile.username,
      action: action,
    };
    const token = await this.generateToken(payload);
    const { user_id: userID, username } = profile;

    Logger.log('cookie=' + token);
    res.cookie('accessToken', token, {
      expires: expiresAt,
      httpOnly: true,
      domain: process.env.BACK_DOMAIN,
    });
    //const username = profile.username;
    //const user_Id = profile.user_id;
    return res
      .status(200)
      .send({ action, user: { userID, username, expiresAt } });
  }

  async checkUser(profile: any): Promise<UserEntity | null> {
    try {
      const user = await this.usersService.findEmail(profile.data.email);
      Logger.log('User found.');
      return user;
    } catch (error) {
      return this.createNewUser(profile);
    }
  }

  private createNewUser(profile: any) {
    Logger.log('Creating new user.');
    const newUser: CreateUserDto = new CreateUserDto();
    newUser.username = profile.data.login;
    newUser.email = profile.data.email;
    newUser.two_factor_enabled = false;
    newUser.user_id_42 = profile.data.id.toString();
    return this.usersService.create(newUser);
  }

  async checkTwoFactor(
    token: string,
    code: string,
    @Response() res,
  ): Promise<boolean> {
    const secretJwt = process.env.SECRET_JWT;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secretJwt,
      });
      const user = await this.usersService.findOne(payload.id);
      const valid =
        this.twoFactorAutenticateService.isTwoFactorAuthenticationCodeValid(
          code,
          user.token_secret,
        );
      let action = '';
      if (valid) {
        action = 'logged';
      } else {
        action = 'authenticate-fail';
      }
      return await this.insertToken(user, res, action);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async login(@Body() body: any, @Response() res) {
    const token = await this.getToken(body.code);
    const profile = await this.getInfo(token);
    const user = await this.checkUser(profile);
    let action = 'logged';
    if (user.two_factor_enabled) {
      action = 'authenticate';
    }
    return await this.insertToken(user, res, action);
  }

  async generateToken(payload: any): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }
}
