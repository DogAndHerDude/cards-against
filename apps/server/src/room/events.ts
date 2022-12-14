export enum OutgoingRoomEvents {
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  MESSAGE = 'MESSAGE',
  ROOM_CREATED = 'ROOM_CREATED',
  ROOM_ERROR = 'ROOM_ERROR',
  ROOM_CLOSED = 'ROOM_CLOSED',
}

export enum IncomingRoomEvents {
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  GET_ROOM = 'GET_ROOM',
  LIST_ROOMS = 'LIST_ROOMS',
  START_GAME = 'START_GAME',
  GAME_EVENT = 'GAME_EVENT',
  MESSAGE = 'MESSAGE',
}

export enum InternalRoomEvents {
  ROOM_CLOSED = 'ROOM_CLOSED',
}
