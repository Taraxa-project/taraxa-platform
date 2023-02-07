import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { JobKeepAliveConfiguration } from 'src/types';
import { ProcessingException } from 'src/types/exceptions/JobProcessing.exception';

@Catch(ProcessingException)
export class JobProcessingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(JobProcessingExceptionFilter.name);
  constructor() {
    this.logger.error('Initialized JobExceptionFilter');
  }
  async catch(exception: ProcessingException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const { queue, data, jobName, message } = exception;
    this.logger.log(message);
    const added = await queue.add(jobName, data, JobKeepAliveConfiguration);
    if (added) {
      this.logger.error(`Put ${added.id} back into ${queue.name}`);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
