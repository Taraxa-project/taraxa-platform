import { NestFactory } from "@nestjs/core";
import { AppCoreModule } from "./modules/app-core.module";

async function bootstrap() {
  await NestFactory.createApplicationContext(AppCoreModule.forRoot("worker"));
}
bootstrap();
