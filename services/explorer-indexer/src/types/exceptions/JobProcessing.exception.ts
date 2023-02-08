import { HttpException, HttpStatus } from '@nestjs/common';
import { Queue } from 'bull';
import { QueueJobs } from '../queues';

export class ProcessingException extends HttpException {
  public queue: Queue = undefined;
  public data: any = undefined;
  public jobName: QueueJobs = undefined;
  constructor(jobName: QueueJobs, data: any, queue: Queue, message: string) {
    super(
      `JOB with data${data} ran into an error: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    this.queue = queue;
    this.data = data;
    this.jobName = jobName;
  }
}
