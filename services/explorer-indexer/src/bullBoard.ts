import { ExpressAdapter } from '@bull-board/express';
import { INestApplication } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';

export const initializeBullBoard = (app: INestApplication) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/bull-board');

  const pbftQueue = app.get<Queue>(`BullQueue_new_pbfts`);
  const dagsQueue = app.get<Queue>(`BullQueue_new_dags`);

  createBullBoard({
    queues: [new BullAdapter(pbftQueue), new BullAdapter(dagsQueue)],
    serverAdapter,
  });
  return serverAdapter.getRouter();
};
