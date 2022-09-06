import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateRequestDto } from 'src/modules/faucet/dto';
import { FaucetService } from 'src/modules/faucet/faucet.service';
import request from 'supertest';
import { bootstrapTestInstance } from './api';

describe('Faucet request tests', () => {
  let app: INestApplication;
  let faucetService: FaucetService;
  let configService: ConfigService;
  let firstTx;

  const oneTaraRequest: CreateRequestDto = {
    address: '0xE749754EC8CF03b1b9E10B81270B73AF66E40F54',
    amount: 1,
    timestamp: new Date(),
  };
  const twoTaraRequest: CreateRequestDto = {
    address: '0xE749754EC8CF03b1b9E10B81270B73AF66E40F54',
    amount: 2,
    timestamp: new Date(),
  };

  const fiveTaraRequest: CreateRequestDto = {
    address: '0xE749754EC8CF03b1b9E10B81270B73AF66E40F54',
    amount: 5,
    timestamp: new Date(),
  };
  const elevenTaraRequest: CreateRequestDto = {
    address: '0xE749754EC8CF03b1b9E10B81270B73AF66E40F54',
    amount: 11,
    timestamp: new Date(),
  };

  beforeAll(async () => {
    ({ app, faucetService, configService } = await bootstrapTestInstance());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should return all requests until now, an empty array', async () => {
    const { status, body: requests } = await getAll(HttpStatus.OK);
    expect(status).toBe(200);
    expect(requests.length).toBe(0);
  });

  it('Should register a request for one TARA', async () => {
    const { status, body: result } = await registerRequest(
      HttpStatus.CREATED,
      oneTaraRequest
    );
    console.log(status);
    firstTx = result;
    console.log(result);
    expect(result.id).toBe(1);
    expect(result.txHash.length).toBeGreaterThan(0);
    expect(result.amount).toBe(1);
    expect(result.createdAt).toContain('Z');
  }, 10000);

  it('Should return the first request', async () => {
    const { body: data } = await getByTxHash(HttpStatus.OK, firstTx.txHash);
    console.log(data);
    expect(data.id).toBe(1);
    expect(data.txHash.length).toBeGreaterThan(0);
    expect(data.amount).toBe(1);
    expect(data.createdAt).toContain('Z');
  });

  it('Should register a request for five TARA', async () => {
    const { body: result } = await registerRequest(
      HttpStatus.CREATED,
      fiveTaraRequest
    );
    expect(result.id).toBe(2);
    expect(result.txHash.length).toBeGreaterThan(0);
    expect(result.amount).toBe(5);
    expect(result.createdAt).toContain('Z');
  }, 10000);

  it('Should register a request for eleven TARA', async () => {
    const result = await registerRequest(
      HttpStatus.BAD_REQUEST,
      elevenTaraRequest
    );

    expect(result.status).toBe(400);
  }, 10000);

  it('Should fail registration of a request for two TARA', async () => {
    const result = await registerRequest(
      HttpStatus.BAD_REQUEST,
      twoTaraRequest
    );

    expect(result.status).toBe(400);
  });

  const registerRequest = async (
    status: HttpStatus,
    requestDTO: Partial<CreateRequestDto>
  ): Promise<any> =>
    await request(app.getHttpServer())
      .post('/faucet/')
      .send({ ...requestDTO })
      .expect(status);

  const getByTxHash = async (
    status: HttpStatus,
    txHash: string
  ): Promise<any> =>
    await request(app.getHttpServer()).get(`/faucet/${txHash}`).expect(status);

  const getAll = async (status: HttpStatus): Promise<any> =>
    await request(app.getHttpServer()).get('/faucet').expect(status);
});
