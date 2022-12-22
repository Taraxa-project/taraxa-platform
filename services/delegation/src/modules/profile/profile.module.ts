import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profile } from "./profile.entity";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService, TypeOrmModule],
})
export class ProfileModule {}
