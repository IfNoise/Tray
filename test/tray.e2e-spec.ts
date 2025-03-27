import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

describe('Tray API (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let jwtService: JwtService;
  let validToken: string;

  beforeAll(async () => {
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

    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Создаем тестовый JWT токен
    validToken = jwtService.sign({
      sub: 'test-user-id',
      resource_access: { 'oauth2-proxy': { roles: ['user'] } },
    });
  });

  afterEach(async () => {
    if (mongoConnection) {
      const collections = mongoConnection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('Tray GraphQL API', () => {
    it('should return empty tray for a new user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', validToken)
        .send({
          query: `
            query {
              tray {
                plants
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.tray).toBeDefined();
          expect(res.body.data.tray[0].plants).toEqual([]);
        });
    });

    it('should add plants to tray', () => {
      const plantsToAdd = ['plant1', 'plant2'];

      return request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', validToken)
        .send({
          query: `
            mutation {
              addPlant(plants: ["plant1", "plant2"]) {
                plants
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.addPlant).toBeDefined();
          expect(res.body.data.addPlant.plants).toContain('plant1');
          expect(res.body.data.addPlant.plants).toContain('plant2');
        });
    });

    it('should clean tray', async () => {
      // Сначала добавляем растения
      await request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', validToken)
        .send({
          query: `
            mutation {
              addPlant(plants: ["plant1", "plant2"]) {
                plants
              }
            }
          `,
        });

      // Затем очищаем лоток
      return request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', validToken)
        .send({
          query: `
            mutation {
              cleanTray {
                plants
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.cleanTray).toBeDefined();
          expect(res.body.data.cleanTray.plants).toEqual([]);
        });
    });

    it('should prevent duplicates when adding plants', async () => {
      // Сначала добавляем растение
      await request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', validToken)
        .send({
          query: `
            mutation {
              addPlant(plants: ["plant1"]) {
                _id
                plants
              }
            }
          `,
        });

      // Пытаемся добавить то же растение еще раз
      return request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', validToken)
        .send({
          query: `
            mutation {
              addPlant(plants: ["plant1", "plant3"]) {
                plants
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.addPlant).toBeDefined();
          expect(res.body.data.addPlant.plants).toContain('plant1');
          expect(res.body.data.addPlant.plants).toContain('plant3');
          // Проверяем, что plant1 не дублируется
          expect(
            res.body.data.addPlant.plants.filter((p) => p === 'plant1').length,
          ).toBe(1);
        });
    });
  });
});
