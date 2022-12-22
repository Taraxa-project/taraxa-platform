import { Connection } from "typeorm";
import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { Node } from "../node/node.entity";
import { NodeCommission } from "../node/node-commission.entity";
import { Delegation } from "../delegation/delegation.entity";
import { DelegationDataService } from "./data/delegation-data.service";
import { StakingDataService } from "./data/staking-data.service";
import { RewardService } from "./reward.service";
import { RewardTaskService } from "./reward-task.service";
import { Reward } from "./reward.entity";
import { RewardRepository } from "./reward.repository";
import { RewardsController } from "./reward.controller";

import indexerConfig from "../../config/indexer";
import delegationConfig from "../../config/delegation";

@Module({
  imports: [
    UserModule,
    ConfigModule.forFeature(indexerConfig),
    ConfigModule.forFeature(delegationConfig),
    TypeOrmModule.forFeature([Reward, Node, NodeCommission, Delegation]),
  ],
  controllers: [RewardsController],
  providers: [
    StakingDataService,
    DelegationDataService,
    RewardService,
    {
      provide: "RewardRepository",
      useFactory: (connection: Connection) =>
        connection.getCustomRepository(RewardRepository),
      inject: [Connection],
    },
  ],
})
export class RewardModule {
  static forRoot(type = "web"): DynamicModule {
    let providers = [];
    if (type === "cron") {
      providers = [RewardTaskService];
    }
    return {
      module: RewardModule,
      providers,
    };
  }
}
