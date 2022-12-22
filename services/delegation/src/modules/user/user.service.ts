import { Raw, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, "communityConnection")
    private userRepository: Repository<User>
  ) {}
  async getUserById(id: number): Promise<User> {
    return await this.userRepository.findOneOrFail({
      id,
    });
  }
  async getUserByAddress(address: string): Promise<User | null> {
    return await this.userRepository.findOneOrFail({
      ethWallet: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
        address,
      }),
    });
  }
  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
