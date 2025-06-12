import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private conn: amqp.Connection;
  private channel: amqp.Channel;
  private readonly url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  async onModuleInit() {
    this.conn = await amqp.connect(this.url);
    this.channel = await this.conn.createChannel();
    await this.channel.assertQueue('late-tasks', { durable: true });
    await this.channel.assertQueue('config-updates', { durable: true });
    console.log('Connected to RabbitMQ');
  }

  async sendToQueue(queue: string, message: any) {
    try {
      if (!this.channel) throw new Error('RabbitMQ channel not initialized');
      await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
      console.log(`Sent to ${queue}:`, message);
    } catch (error) {
      console.error(`Error sending to ${queue}:`, error.message);
      throw error; // Để service xử lý lỗi
    }
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.conn.close();
    console.log('Disconnected from RabbitMQ');
  }
}