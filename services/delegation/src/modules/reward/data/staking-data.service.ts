import _ from "lodash";
import * as ethers from "ethers";
import { request, gql } from "graphql-request";
import IntervalTree, { Interval } from "@flatten-js/interval-tree";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface Event {
  id: string;
  user: string;
  amount: number;
  type: string;
  timestamp: number;
}

export interface StakingIntervalValue {
  startsAt: number;
  endsAt: number;
  value: Event;
}

@Injectable()
export class StakingDataService {
  private stakingUrl: string;
  constructor(config: ConfigService) {
    this.stakingUrl = config.get("indexer.stakingUrl");
  }
  async getData(endTime: number) {
    const events = await this.getEvents();
    const groupedEvents = _.groupBy(events, (e) =>
      ethers.utils.getAddress(e.user)
    );

    return Object.keys(groupedEvents).map((user) => {
      let events = _.sortBy(groupedEvents[user], "timestamp");

      let currentBalance = 0;
      events = events.map((e) => {
        if (e.type === "DEPOSIT") {
          currentBalance += e.amount;
        } else {
          currentBalance -= e.amount;
        }
        return {
          ...e,
          amount: currentBalance,
        };
      });

      const sortedEvents = events.reverse();
      let lastEndAt = endTime;
      const tree = new IntervalTree<StakingIntervalValue>();
      for (const event of sortedEvents) {
        const startsAt = event.timestamp;
        const endsAt = lastEndAt;
        tree.insert(new Interval(startsAt, endsAt), {
          startsAt,
          endsAt,
          value: event,
        });
        lastEndAt = startsAt - 1;
      }

      return {
        user: user,
        events: tree,
      };
    });
  }
  private async getEvents() {
    const limit = 1000;
    let page = 1;
    let result = await this.getPaginatedEvents(page, limit);
    let data = [...result];
    while (result.length === limit) {
      page++;
      result = await this.getPaginatedEvents(page, limit);
      data = [...data, ...result];
    }
    return data;
  }
  private async getPaginatedEvents(page = 1, limit: number) {
    const skip = (page - 1) * limit;
    try {
      const query = gql`
        query {
          stakingEvents(first: ${limit}, skip: ${skip}, orderBy: timestamp, orderDirection: asc) {
            id
            user
            amount
            type
            timestamp
          }
        }
      `;
      const response = await request(this.stakingUrl, query);
      return response.stakingEvents.map((e) => ({
        ...e,
        amount: ethers.BigNumber.from(e.amount)
          .div(ethers.BigNumber.from(10).pow(18))
          .toNumber(),
        timestamp: parseInt(e.timestamp, 10),
      }));
    } catch (e) {
      return [];
    }
  }
}
