import {
  Controller,
  Body,
  Post,
  HttpCode,
  Response,
  Headers,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { TwoFactorAutenticateService } from '../two-factor-autenticate/two-factor-autenticate.service';
import { Res } from '@nestjs/common';

@Controller('')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly twoFactorService: TwoFactorAutenticateService,
  ) {}

  @Post('generate')
  async register(
    @Res() response: Response,
    @Headers('accessToken') authHeader: string,
  ) {
    console.log(authHeader);
    const { otpauthUrl } = await this.twoFactorService.generateSecret('aaa');
    return this.twoFactorService.pipeQrCodeStream(response, otpauthUrl);
  }

  @Post('check')
  async checkCode(@Body() body: any) {
    const token = body.token;
    const secret = body.secret;
    const isValid =
      await this.twoFactorService.isTwoFactorAuthenticationCodeValid(
        token,
        secret,
      );
    console.info('Is Valid' + isValid);
  }

  @Post('/auth/user')
  @HttpCode(200)
  async getToken(@Body() body: any, @Response() res): Promise<Response> {
    const profile = await this.loginService.getToken(body.code, res);

    try {
      if (profile) {
        res.status(200).send('{ "action":"logged"');
        console.log('logado');
      } else {
        res.status(200).send('{ "action":"authenticate"}');
        console.log('authenticate');
      }
    } catch (error) {
      console.error('Erro ao obter token:', error.message);
      return res.status(500).send({ error: 'Erro ao obter token' });
    }
  }

  @Post('/checkTwoFactor')
  @HttpCode(200)
  async checkTwoFactor(
    @Body() body: any,
    @Headers('accessToken') authHeader: string,
    @Response() res,
  ) {
    const valid = await this.loginService.checkTwoFactor(authHeader, body.code);
    if (valid) res.status(200).send('{ "action":"logged"');
    else res.status(401).send('{ "action":"authenticate-fail"}');
  }
}
