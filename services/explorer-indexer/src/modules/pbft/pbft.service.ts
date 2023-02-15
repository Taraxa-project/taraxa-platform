import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPBFT,
  ITransaction,
  zeroX,
  toChecksumAddress,
  PbftEntity,
} from '@taraxa_project/explorer-shared';
import { IGQLPBFT } from 'src/types';
import { MoreThanOrEqual, Repository } from 'typeorm';
import DagService from '../dag/dag.service';
import TransactionService from '../transaction/transaction.service';

@Injectable()
export default class PbftService {
  private readonly logger: Logger = new Logger(PbftService.name);
  private isRedisConnected: boolean;
  private isTransactionConsumer: boolean;
  constructor(
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>,
    private txService: TransactionService,
    private dagService: DagService,
    private readonly configService: ConfigService
  ) {
    this.pbftRepository = pbftRepository;
    this.isRedisConnected = true;
    this.isTransactionConsumer = configService.get<boolean>(
      'isTransactionConsumer'
    );
  }

  public getRedisConnectionState() {
    return this.isRedisConnected;
  }

  public setRedisConnectionState(state: boolean) {
    this.isRedisConnected = state;
  }

  public async getMissingPbftPeriods() {
    const lastBlockSaved = (
      await this.pbftRepository.query(
        `SELECT MAX("number") as "last_saved" FROM ${this.pbftRepository.metadata.tableName}`
      )
    )[0].last_saved;
    const missingNumbers: number[] = (
      await this.pbftRepository.query(
        `SELECT s.i AS "missing_number" FROM generate_series(0, ${
          lastBlockSaved || 0
        }) s(i) WHERE NOT EXISTS (SELECT 1 FROM ${
          this.pbftRepository.metadata.tableName
        } WHERE number = s.i)`
      )
    ).map((res: { missing_number: number }) => res.missing_number);
    return missingNumbers;
  }

  public async safeSavePbft(pbft: IPBFT) {
    if (!pbft || !pbft.hash) {
      return;
    }
    let _pbft;
    const indexedPbft = await this.pbftRepository.findOneBy({
      hash: pbft.hash,
    });
    if (!indexedPbft) {
      _pbft = this.pbftRepository.create({
        hash: pbft.hash,
      });
    } else {
      _pbft = indexedPbft;
    }
    _pbft.miner = toChecksumAddress(pbft.miner);
    _pbft.number = pbft.number;
    _pbft.timestamp = pbft.timestamp;
    _pbft.nonce = pbft.nonce;
    _pbft.reward = pbft.reward;
    _pbft.gasLimit = String(pbft.gasLimit || '0');
    _pbft.gasUsed = String(pbft.gasUsed || '0');
    _pbft.parent = pbft.parent;
    _pbft.difficulty = pbft.difficulty;
    _pbft.totalDifficulty = pbft.totalDifficulty;
    _pbft.transactionCount = pbft.transactions?.length || pbft.transactionCount;
    _pbft.extraData = pbft.extraData;
    _pbft.logsBloom = pbft.logsBloom;
    _pbft.mixHash = pbft.mixHash;
    _pbft.recepitsRoot = pbft.recepitsRoot;
    _pbft.sha3Uncles = pbft.sha3Uncles;
    _pbft.size = pbft.size;
    _pbft.stateRoot = pbft.stateRoot;
    _pbft.transactionsRoot = pbft.transactionsRoot;
    if (indexedPbft) {
      const savedPbft = await this.pbftRepository.save(_pbft);
      if (savedPbft) {
        const pbftFound = await this.pbftRepository.findOne({
          where: {
            hash: _pbft.hash,
          },
          relations: ['transactions'],
        });
        return pbftFound;
      }
    }

    try {
      const saved = await this.pbftRepository
        .createQueryBuilder()
        .insert()
        .into(PbftEntity)
        .values(_pbft)
        .orIgnore(indexedPbft !== null)
        .returning('*')
        .execute();

      if (saved) {
        this.logger.log(`Registered new PBFT ${_pbft.hash}`);

        if (pbft.transactions?.length > 0) {
          const newTransactions: ITransaction[] = pbft.transactions.map(
            (transaction) => {
              return pbft.number === 0 || this.isTransactionConsumer
                ? {
                    ...transaction,
                    block: {
                      id: saved.raw[0]?.id,
                      hash: saved.raw[0]?.hash,
                      number: saved.raw[0]?.number,
                      timestamp: saved.raw[0]?.timestamp,
                    },
                  }
                : {
                    hash: transaction.hash,
                    block: {
                      id: saved.raw[0]?.id,
                      hash: saved.raw[0]?.hash,
                      number: saved.raw[0]?.number,
                      timestamp: saved.raw[0]?.timestamp,
                    },
                  };
            }
          );

          _pbft.transactions =
            await this.txService.findTransactionsByHashesOrFill(
              newTransactions
            );
          _pbft.transactionCount = _pbft.transactions?.length;
          _pbft.save();
        }
      }
      const pbftFound = await this.pbftRepository.findOne({
        where: {
          hash: _pbft.hash,
        },
        relations: ['transactions'],
      });
      return pbftFound;
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`Error when saving PBFT: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  public async checkAndDeletePbftsGreaterThanNumber(
    pbftNumber: number
  ): Promise<void> {
    const pbfts = await this.pbftRepository.find({
      where: {
        number: MoreThanOrEqual(pbftNumber),
      },
    });
    if (pbfts?.length > 0) {
      try {
        for (const pbft of pbfts) {
          await this.dagService.findAndRemoveDagsForPbftPeriod(pbft.number);
        }

        this.logger.debug(
          `Deleting ${pbfts?.length} PBFTs with number greater or equal than ${pbftNumber}`
        );

        await this.pbftRepository.remove(pbfts);
        this.logger.debug(`Deleted ${pbfts?.length} PBFTs`);
      } catch (error) {
        // Call method for removing first Transactions, then Dags, then PBFTS
        this.logger.error(`Erroneous data could not be saved! `, error);
        // this.logger.debug(`Trying deletion again ...`);
        // await this.pbftRepository.delete(pbfts.map((pbft) => pbft.id));
        // for (const pbft of pbfts) {
        //   await this.txService.deleteTransactions(pbft.transactions);
        // }
      }
    }
  }

  public async clearPbftData() {
    await this.pbftRepository.query(
      `DELETE FROM "${this.pbftRepository.metadata.tableName}"`
    );
  }

  public async getPbftsOfLastLevel(limit: number) {
    return await this.pbftRepository
      .createQueryBuilder('pbfts')
      .leftJoinAndSelect('pbfts.transactions', 'transactions')
      .select()
      .orderBy('pbfts.number', 'DESC')
      .limit(limit)
      .getMany();
  }

  public async getBlockByNumber(number: number) {
    return await this.pbftRepository.findOneBy({ number });
  }

  public async getBlockByHash(hash: string) {
    return await this.pbftRepository.findOneBy({ hash });
  }

  public getLastPbftHash = async () => {
    return (
      await this.pbftRepository
        .createQueryBuilder('pbfts')
        .leftJoinAndSelect('pbfts.transactions', 'transactions')
        .select()
        .orderBy('pbfts.timestamp', 'DESC')
        .limit(1)
        .getOne()
    )?.hash;
  };

  public getLastPBFTNumber = async () => {
    return (
      await this.pbftRepository.query(
        'select max(number) as last_block from pbfts'
      )
    ).map((res: { last_block: number }) => res.last_block)[0];
  };

  public pbftGQLToIPBFT(pbftGQL: IGQLPBFT) {
    const {
      hash,
      number,
      timestamp,
      gasLimit,
      gasUsed,
      nonce,
      difficulty,
      totalDifficulty,
      miner,
      transactionsRoot,
      extraData,
      transactions,
      logsBloom,
      mixHash,
      recepitsRoot,
      ommerHash,
      stateRoot,
      parent,
    } = { ...pbftGQL };
    if (!hash) return;
    const pbft: IPBFT = {
      hash: zeroX(hash),
      number: number || 0,
      timestamp: timestamp || 0,
      gasLimit: gasLimit || 0,
      gasUsed: gasUsed || 0,
      parent: zeroX(parent?.hash),
      nonce,
      difficulty: difficulty || 0,
      totalDifficulty: totalDifficulty || 0,
      miner: zeroX(miner?.address),
      transactionsRoot: zeroX(transactionsRoot),
      transactionCount: transactions?.length || 0,
      transactions:
        transactions?.map((tx) => this.txService.gQLToITransaction(tx)) || [],
      extraData: zeroX(extraData),
      logsBloom: zeroX(logsBloom),
      mixHash: zeroX(mixHash),
      recepitsRoot: zeroX(recepitsRoot),
      sha3Uncles: zeroX(ommerHash),
      size: 0,
      stateRoot: zeroX(stateRoot),
    };
    return pbft;
  }
}
