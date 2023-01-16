import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

export interface RPCRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: string[];
}

export function request(name: string, params: string[] = [], id = 0) {
  return {
    jsonrpc: '2.0',
    id,
    method: name,
    params: params,
  };
}

@Injectable()
export class RPCConnectorService {
  private readonly connectionURL: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.connectionURL = this.configService.get<string>(
      'general.rpcConnectionURL'
    );
  }

  public async send(request: RPCRequest) {
    if (!this.connectionURL) throw new Error('RPC Connection URL not set!');
    return firstValueFrom(
      this.httpService
        .post(this.connectionURL, request)
        .pipe(
          catchError(() => {
            throw new ForbiddenException('API not available');
          })
        )
        .pipe(
          map((res: AxiosResponse) => {
            // console.log(res);
            return res.data?.result;
          })
        )
    );
  }

  public async netVersion() {
    return await this.send(request('net_version'));
  }

  public async netPeerCount() {
    return await this.send(request('net_peerCount'));
  }

  public async getBlockByHash(hash: string, fullTransactions = false) {
    return await this.send(
      request('eth_getBlockByHash', [hash, fullTransactions] as any[])
    );
  }

  public async getBlockByNumber(number: number, fullTransactions = false) {
    return await this.send(
      request('eth_getBlockByNumber', [
        number.toString(16),
        fullTransactions,
      ] as any[])
    );
  }

  public async blockNumber() {
    return await this.send(request('eth_blockNumber', []));
  }

  public async dagBlockLevel() {
    return await this.send(request('taraxa_dagBlockLevel', []));
  }

  public async getDagBlockByHash(hash: string, fullTransactions = false) {
    return await this.send(
      request('taraxa_getDagBlockByHash', [hash, fullTransactions] as any[])
    );
  }

  public async dagBlockPeriod() {
    return await this.send(request('taraxa_dagBlockPeriod', []));
  }

  public async getDagBlocksByLevel(level: number, fullTransactions = false) {
    return await this.send(
      request('taraxa_getDagBlockByLevel', [
        level.toString(16),
        `${fullTransactions}`,
      ])
    );
  }

  public async getScheduleBlockByPeriod(period: number) {
    return await this.send(
      request('taraxa_getScheduleBlockByPeriod', [period.toString(16)])
    );
  }

  public async getTransactionByHash(hash: string) {
    return await this.send(request('eth_getTransactionByHash', [hash]));
  }

  public async getTransactionReceipt(hash: string) {
    return await this.send(request('eth_getTransactionReceipt', [hash]));
  }
}
