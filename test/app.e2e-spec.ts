import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    // Создаем in-memory MongoDB для тестов
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Получаем соединение с MongoDB
    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    // Очищаем данные после каждого теста
    if (mongoConnection) {
      const collections = mongoConnection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  });

  afterAll(async () => {
    // Закрываем соединения и освобождаем ресурсы
    await app.close();
    await mongoServer.stop();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET) should return status as up', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toEqual('ok');
      });
  });

  it('/graphql endpoint should be available', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: '{ __schema { types { name } } }',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
      });
  });
});
