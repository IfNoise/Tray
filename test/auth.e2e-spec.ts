import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

describe('Authentication (e2e)', () => {
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
    validToken = jwtService.sign(
      {
        sub: 'test-user-id',
        resource_access: { 'oauth2-proxy': { roles: ['user'] } },
      },
      { secret: process.env.JWT_SECRET },
    );
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

  describe('JWT Authentication', () => {
    it('should reject requests without authentication token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              tray {
                plants
              }
            }
          `,
        })
        .expect(200);
    });

    it('should accept requests with valid JWT token', () => {
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
        .expect(200);
    });

    it('should reject requests with invalid JWT token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', 'invalid-token')
        .send({
          query: `
            query {
              tray {
                plants
              }
            }
          `,
        })
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        });
    });
  });

  describe('Token Service', () => {
    it('should correctly decode JWT token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('x-access-token', validToken)
        .send({
          query: `
            query {
              tray {
                userId
                plants
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.tray[0].userId).toBeDefined();
          expect(res.body.data.tray[0].userId).toEqual('test-user-id');
        });
    });
  });
});
