import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserExistsError } from './errors/UserExistsError';
import { UserNotFoundError } from './errors/UserNotFoundError';
import { User } from './User';

@Injectable()
export class UserService {
  private users = new Map<string, User>();

  public createUser(name: string, socket: Socket) {
    if (this.userExists(name)) {
      throw new UserExistsError(name);
    }

    const user = new User(name, socket);

    this.users.set(user.id, user);

    return user;
  }

  public getUser(id: string) {
    const user = this.users.get(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user;
  }

  public removeUser(id: string) {
    this.users.delete(id);
  }

  private userExists(name: string) {
    const users = this.users.values();

    for (const user of users) {
      if (user.name === name) {
        return true;
      }
    }

    return false;
  }
}
