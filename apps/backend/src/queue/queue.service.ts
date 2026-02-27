import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly queue = new Queue('automations', {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
    },
  });

  add(jobName: string, payload: unknown, delay = 0) {
    return this.queue.add(jobName, payload, { delay });
  }
}
