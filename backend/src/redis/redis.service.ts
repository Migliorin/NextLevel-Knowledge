import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
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

  async setExtractionStatus(
    documentProtocolId: string,
    status: number,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const key = this.getPrimaryExtractionStatusKey(documentProtocolId);
    const value = JSON.stringify({
      ...metadata,
      documentProtocolId,
      status,
      statusId: status,
      updatedAt: new Date().toISOString(),
    });

    try {
      await this.client.set(key, value);
    } catch (error) {
      this.logger.warn(
        `Nao foi possivel gravar status de extracao no Redis (${key}): ${this.getRedisErrorMessage(error)}`,
      );
    }
  }

  async getExtractionStatus(documentProtocolId: string): Promise<string | null> {
    const customKey = this.configService
      .get<string>('AI_DOCUMENT_STATUS_REDIS_KEY_PREFIX')
      ?.trim();

    const keys = [
      customKey ? `${customKey}:${documentProtocolId}` : null,
      this.getPrimaryExtractionStatusKey(documentProtocolId),
      `ai:document:${documentProtocolId}:status`,
      `ai:documents:${documentProtocolId}:status`,
      `ai:extraction:${documentProtocolId}:status`,
      `ai:document_status:${documentProtocolId}`,
      `ai:status:${documentProtocolId}`,
    ].filter((key): key is string => Boolean(key));

    for (const key of keys) {
      const value = await this.getAllowedKey(key);

      if (value !== null) {
        return value;
      }
    }

    return null;
  }

  async deleteExtractionStatus(documentProtocolId: string): Promise<void> {
    const keys = this.getExtractionStatusKeys(documentProtocolId);

    try {
      await this.client.del(keys);
    } catch (error) {
      this.logger.warn(
        `Nao foi possivel remover status de extracao no Redis (${keys.join(', ')}): ${this.getRedisErrorMessage(error)}`,
      );
    }
  }

  getPrimaryExtractionStatusKey(documentProtocolId: string): string {
    const customKey = this.configService
      .get<string>('AI_DOCUMENT_STATUS_REDIS_KEY_PREFIX')
      ?.trim();

    return customKey
      ? `${customKey}:${documentProtocolId}`
      : `ai:document:${documentProtocolId}:status`;
  }

  private getExtractionStatusKeys(documentProtocolId: string): string[] {
    const customKey = this.configService
      .get<string>('AI_DOCUMENT_STATUS_REDIS_KEY_PREFIX')
      ?.trim();

    return [
      customKey ? `${customKey}:${documentProtocolId}` : null,
      this.getPrimaryExtractionStatusKey(documentProtocolId),
      `ai:document:${documentProtocolId}:status`,
      `ai:documents:${documentProtocolId}:status`,
      `ai:extraction:${documentProtocolId}:status`,
      `ai:document_status:${documentProtocolId}`,
      `ai:status:${documentProtocolId}`,
    ].filter((key, index, keys): key is string => Boolean(key) && keys.indexOf(key) === index);
  }

  private getBlacklistKey(token: string): string {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    return `auth:blacklist:${tokenHash}`;
  }

  private async getAllowedKey(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.warn(
        `Nao foi possivel ler chave de status no Redis (${key}): ${this.getRedisErrorMessage(error)}`,
      );
      return null;
    }
  }

  private getRedisErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'erro desconhecido';
  }

}
