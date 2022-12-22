import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET || "b277b777-4f8d-4e6e-a41f-25afdc5fe33e",
}));
