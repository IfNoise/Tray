import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtService } from '@nestjs/jwt';

export class TestUtils {
  private app: INestApplication;
  private moduleFixture: TestingModule;
  private mongoServer: MongoMemoryServer;
  private mongoConnection: Connection;
  private jwtService: JwtService;

  async initializeTestEnvironment(): Promise<void> {
    this.mongoServer = await MongoMemoryServer.create();
    const uri = this.mongoServer.getUri();

    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test-jwt-secret';

    this.moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.moduleFixture.createNestApplication();
    await this.app.init();

    this.mongoConnection =
      this.moduleFixture.get<Connection>(getConnectionToken());
    this.jwtService = this.moduleFixture.get<JwtService>(JwtService);
  }

  getApp(): INestApplication {
    return this.app;
  }

  getModuleFixture(): TestingModule {
    return this.moduleFixture;
  }

  getMongoConnection(): Connection {
    return this.mongoConnection;
  }

  getJwtService(): JwtService {
    return this.jwtService;
  }

  generateToken(userId: string, roles: string[] = ['user']): string {
    return this.jwtService.sign(
      {
        sub: userId,
        resource_access: { 'oauth2-proxy': { roles } },
      },
      { secret: process.env.JWT_SECRET },
    );
  }

  async clearDatabase(): Promise<void> {
    if (this.mongoConnection) {
      const collections = this.mongoConnection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  }

  async closeTestEnvironment(): Promise<void> {
    await this.app.close();
    await this.mongoServer.stop();
  }
}
