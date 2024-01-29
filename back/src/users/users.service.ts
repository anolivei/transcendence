import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './repositories/users.repository';
import { JwtService } from '@nestjs/jwt';

import { NotFoundError } from '../common/errors/types/NotFoundError';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  createNewUser(profile: any) {
    const newUser: CreateUserDto = new CreateUserDto();
    newUser.username = profile.login;
    newUser.email = profile.email;
    newUser.two_factor_enabled = false;
    newUser.user_id_42 = profile.id;
    this.repository.create(newUser);
    console.log('Novo usuário criado');
    console.log(newUser);
  }

  create(createUserDto: CreateUserDto) {
    return this.repository.create(createUserDto);
  }

  findAll() {
    return this.repository.findAll();
  }

  findByToken(userId: any) {
    return this.findOne(userId);
  }

  async findOne(user_id: number): Promise<UserEntity> {
    const user = await this.repository.findOne(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async findEmail(user_email: string): Promise<UserEntity> {
    const user = await this.repository.findEmail(user_email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  update(user_id: number, updateUserDto: UpdateUserDto) {
    return this.repository.update(user_id, updateUserDto);
  }

  remove(user_id: number) {
    return this.repository.remove(user_id);
  }

  findFriends(userId: any): Promise<Friends[] | null> {
    return this.repository.findFriends(userId);
  }
}
