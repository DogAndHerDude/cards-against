import 'reflect-metadata';
import { User } from '@/user/User';
import { Room } from '../room';
import { ROOM_ERROR, ROOM_ERRORS } from '../room.errors';

const roomIdMetadataKey = Symbol('RoomId');
const ownerMetadataKey = Symbol('Owner');
const ownerParamMetadataKey = Symbol('OwnerParam');

export function RoomId(target, propertyKey: string) {
  let value: string;

  Object.defineProperty(target, propertyKey, {
    get: () => value,
    set: (nextValue: string) => {
      Reflect.defineMetadata(roomIdMetadataKey, nextValue, target);
      value = nextValue;
    },
  });
}

export function Owner(target, propertyKey: string) {
  let value: User;

  Object.defineProperty(target, propertyKey, {
    get: () => value,
    set: (nextValue: User) => {
      Reflect.defineMetadata(ownerMetadataKey, nextValue, target);
      value = nextValue;
    },
  });
}

export function OwnerParam(
  target,
  propertyKey: keyof Room,
  paramIndex: number,
) {
  Reflect.defineMetadata(ownerParamMetadataKey, paramIndex, target);
}

export function ValidateOwner(
  target,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
) {
  const owner = Reflect.getMetadata(ownerMetadataKey, target);
  const argIndex = Reflect.getMetadata(ownerParamMetadataKey, target);
  const method = descriptor.value;

  descriptor.value = function (...args) {
    if (args[argIndex] !== owner) {
      this.server.to(this.id).emit(ROOM_ERROR, {
        message: ROOM_ERRORS.NOT_OWNER_ERROR,
      });
      return;
    }

    return method.apply(this, args);
  };
}
