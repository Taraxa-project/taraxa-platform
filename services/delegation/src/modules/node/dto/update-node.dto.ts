import { PickType } from "@nestjs/swagger";
import { CreateNodeDto } from "./create-node.dto";

export class UpdateNodeDto extends PickType(CreateNodeDto, [
  "name",
  "ip",
] as const) {}
