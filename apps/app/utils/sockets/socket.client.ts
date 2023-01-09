import { io, Socket } from "socket.io-client";

export class SocketClient {
  public static readonly URL = "http://localhost:3000";

  private static instance?: SocketClient;

  private client: Socket;

  private constructor(token: string) {
    this.client = io(SocketClient.URL, {
      auth: {
        token,
      },
    });
  }

  public static getClient(token?: string): SocketClient {
    if (SocketClient.instance) {
      return SocketClient.instance;
    }

    if (!token) {
      throw new Error("SocketClient needs a token to connect to the server.");
    }

    SocketClient.instance = new SocketClient(token);

    return SocketClient.instance;
  }

  public on<T = unknown>(event: string, callback: (paylload: T) => void) {
    this.client.on(event, callback);
  }

  public off(event: string) {
    this.client.off(event);
  }

  public emit(event: string, ...args: any[]) {
    this.client.emit(event, ...args);
  }
}
