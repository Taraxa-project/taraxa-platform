import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs';

export function request(name: string, params: string[] = [], id = 0) {
  return {
    jsonrpc: '2.0',
    id,
    method: name,
    params: params,
  };
}

@Injectable()
export default class RPCConnectorService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  public async send(request: any) {
    return (
      this.httpService
        .post(this.configService.get<string>('general.connectionURL'), request)
        .pipe(
          catchError(() => {
            throw new ForbiddenException('API not available');
          })
        )
        .pipe(map((res) => res.data?.result)) || ({} as any)
    );
  }

  public async netVersion() {
    return this.send(request('net_version'));
  }

  public async netPeerCount() {
    return this.send(request('net_peerCount'));
  }

  public async getBlockByHash(hash: string, fullTransactions = false) {
    return this.send(
      request('eth_getBlockByHash', [hash, `${fullTransactions}`])
    );
  }

  public async getBlockByNumber(number: number, fullTransactions = false) {
    return this.send(
      request('eth_getBlockByNumber', [
        number.toString(16),
        `${fullTransactions}`,
      ])
    );
  }

  public async blockNumber() {
    return this.send(request('eth_blockNumber', []));
  }

  public async dagBlockLevel() {
    return this.send(request('taraxa_dagBlockLevel', []));
  }

  public async getDagBlockByHash(hash: string, fullTransactions = false) {
    return this.send(
      request('taraxa_getDagBlockByHash', [hash, `${fullTransactions}`])
    );
  }

  public async dagBlockPeriod() {
    return this.send(request('taraxa_dagBlockPeriod', []));
  }

  public async getDagBlocksByLevel(level: number, fullTransactions = false) {
    return this.send(
      request('taraxa_getDagBlockByLevel', [
        level.toString(16),
        `${fullTransactions}`,
      ])
    );
  }

  public async getScheduleBlockByPeriod(period: number) {
    return this.send(
      request('taraxa_getScheduleBlockByPeriod', [period.toString(16)])
    );
  }

  public async getTransactionByHash(hash: string) {
    return this.send(request('eth_getTransactionByHash', [hash]));
  }

  public async getTransactionReceipt(hash: string) {
    return this.send(request('eth_getTransactionReceipt', [hash]));
  }
}
