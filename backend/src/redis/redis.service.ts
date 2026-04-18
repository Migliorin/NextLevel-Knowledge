import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      url: this.configService.getOrThrow<string>('REDIS_URL'),
      username: this.configService.getOrThrow<string>('REDIS_USERNAME'),
      password: this.configService.getOrThrow<string>('REDIS_PASSWORD'),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async blacklistAccessToken(token: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) {
      return;
    }

    await this.client.set(this.getBlacklistKey(token), '1', {
      expiration: {
        type: 'EX',
        value: ttlSeconds,
      },
    });
  }

  async isAccessTokenBlacklisted(token: string): Promise<boolean> {
    const value = await this.client.get(this.getBlacklistKey(token));

    return value === '1';
  }

  private getBlacklistKey(token: string): string {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    return `auth:blacklist:${tokenHash}`;
  }

}
