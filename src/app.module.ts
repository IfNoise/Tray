import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/logger.middlewware';
import { AuthModule } from './auth/auth.module';
import { TrayModule } from './tray/tray.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TokenService } from './auth/token.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    TrayModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      typePaths: ['./**/*.graphql'],
      context: ({ req }) => {
        const token = 'justtest'; //req.headers['x-access-token'];
        let userId = null;
        let roles = [];

        if (token) {
          try {
            const tokenService = new TokenService();
            const decodedToken = tokenService.decodeToken(token);
            userId = decodedToken['sub'];
            roles =
              decodedToken['resource_access']['oauth2-proxy']['roles'] || [];
          } catch (error) {
            console.error('Invalid token', error);
          }
        }

        return { req, userId, roles };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TokenService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
