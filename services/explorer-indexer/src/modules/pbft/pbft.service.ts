import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPBFT,
  ITransaction,
  zeroX,
  toChecksumAddress,
  PbftEntity,
} from '@taraxa_project/explorer-shared';
import { IGQLPBFT } from 'src/types';
import { Repository } from 'typeorm';
import TransactionService from '../transaction/transaction.service';

@Injectable()
export default class PbftService {
  private readonly logger: Logger = new Logger(PbftService.name);
  private isRedisConnected: boolean;
  constructor(
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>,
    private txService: TransactionService
  ) {
    this.pbftRepository = pbftRepository;
    this.isRedisConnected = true;
  }

  public getRedisConnectionState() {
    return this.isRedisConnected;
  }

  public setRedisConnectionState(state: boolean) {
    this.isRedisConnected = state;
  }

  public async safeSavePbft(pbft: IPBFT) {
    if (!pbft || !pbft.hash) {
      return;
    }
    let _pbft;
    try {
      _pbft = await this.pbftRepository.findOneBy({ hash: pbft.hash });
      if (!_pbft) {
        const newPbft = this.pbftRepository.create({
          hash: pbft.hash,
          miner: toChecksumAddress(pbft.miner),
          number: pbft.number,
          timestamp: pbft.timestamp,
          nonce: pbft.nonce,
          reward: pbft.reward,
          gasLimit: String(pbft.gasLimit || '0'),
          gasUsed: String(pbft.gasUsed || '0'),
          parent: pbft.parent,
          difficulty: pbft.difficulty,
          totalDifficulty: pbft.totalDifficulty,
          transactionCount: pbft.transactions?.length || pbft.transactionCount,
          extraData: pbft.extraData,
          logsBloom: pbft.logsBloom,
          mixHash: pbft.mixHash,
          recepitsRoot: pbft.recepitsRoot,
          sha3Uncles: pbft.sha3Uncles,
          size: pbft.size,
          stateRoot: pbft.stateRoot,
          transactionsRoot: pbft.transactionsRoot,
        });
        _pbft = newPbft;
      }

      const saved = await this.pbftRepository
        .createQueryBuilder()
        .insert()
        .into(PbftEntity)
        .values(_pbft)
        .orUpdate(['hash'], 'UQ_35a84f8058f83feff8f2941de6a')
        .setParameter('hash', _pbft?.hash || pbft.hash)
        .returning('*')
        .execute();

      if (saved) {
        this.logger.log(`Registered new PBFT ${_pbft.hash}`);

        if (pbft.transactions?.length > 0) {
          const newTransactions: ITransaction[] = pbft.transactions.map(
            (transaction) => {
              return {
                ...transaction,
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
      const pbftFound = await this.pbftRepository.findOneBy({
        hash: _pbft.hash,
      });
      return pbftFound;
    } catch (error) {
      console.error(error);
    }
  }

  public async clearPbftData() {
    await this.pbftRepository.query('DELETE FROM "pbfts"');
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
