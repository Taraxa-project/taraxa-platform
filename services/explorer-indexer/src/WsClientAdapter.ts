import {
  WebSocketAdapter,
  INestApplicationContext,
  Logger,
} from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { fromEvent, Observable } from 'rxjs';
import { filter, first, map, mergeMap, share, takeUntil } from 'rxjs/operators';

export class WsClientAdapter implements WebSocketAdapter {
  private server: WebSocket;
  private readonly logger: Logger = new Logger(WsClientAdapter.name);
  constructor(
    private app: INestApplicationContext,
    port: number,
    endpoint: string
  ) {
    this.logger.log(`Creating ws client adapter for endpoint: ${endpoint}`);
    this.create(port, endpoint);
  }

  create(port: number, endpoint: string): WebSocket {
    if (!endpoint)
      throw new Error('NODE_WS_ENDPOINT uninitialized. Please set it!');
    const client = new WebSocket(process.env.NODE_WS_ENDPOINT, { port });
    this.server = client;
    if (this.server.OPEN)
      this.logger.log(`Connection open at ${this.server.url}`);
    return client;
  }

  bindClientConnect(server: WebSocket, callback: () => void) {
    this.server.on('connect', callback);
  }

  bindClientDisconnect(client: WebSocket, callback: () => void) {
    this.server.on('disconnect', callback);
  }

  public bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>
  ) {
    const disconnect$ = fromEvent(this.server, 'disconnect').pipe(
      share(),
      first()
    );

    handlers.forEach(({ message, callback }) => {
      const source$ = fromEvent(this.server, message).pipe(
        mergeMap((payload: any) => {
          const { data, ack } = this.mapPayload(payload);
          return transform(callback(data, ack)).pipe(
            filter((response: any) => !isNil(response)),
            map((response: any) => [response, ack])
          );
        }),
        takeUntil(disconnect$)
      );
      source$.subscribe(([response, ack]) => {
        if (response.event) {
          return client.emit(response.event, response.data);
        }
        isFunction(ack) && ack(response);
      });
    });
  }

  public mapPayload(payload: any): { data: any; ack?: any } {
    if (!Array.isArray(payload)) {
      return { data: payload };
    }
    const lastElement = payload[payload.length - 1];
    const isAck = isFunction(lastElement);
    if (isAck) {
      const size = payload.length - 1;
      return {
        data: size === 1 ? payload[0] : payload.slice(0, size),
        ack: lastElement,
      };
    }
    return { data: payload };
  }

  close() {
    this.server.close();
  }
}
