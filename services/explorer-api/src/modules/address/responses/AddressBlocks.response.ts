import { DagEntity, PbftEntity } from '@taraxa_project/explorer-shared';

export interface PbftsPaginate {
  data: PbftEntity[];
  total: number;
}

export interface DagsPaginate {
  data: DagEntity[];
  total: number;
}
