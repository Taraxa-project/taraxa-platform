import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NodeModule } from './modules/node/node.module';
import { NodeService } from './modules/node/node.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const commandService = app
    .select(NodeModule)
    .get(NodeService, { strict: true });

  const nodes = async () => {
    console.log(await commandService.findNodes({}));
  };

  await yargs(hideBin(process.argv))
    .command('nodes', 'get all nodes', nodes)
    .command('nodes', 'get all nodes', nodes).argv;
  await app.close();
}
bootstrap();
