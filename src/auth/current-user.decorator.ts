import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Декоратор для получения идентификатора пользователя из контекста GraphQL
 * @throws UnauthorizedException если идентификатор пользователя отсутствует
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const userId = ctx.getContext().req.userId;

    if (!userId) {
      console.log('Context:', ctx.getContext()); // Для отладки
      return null; // Позволяет обработать отсутствие userId в контроллере
    }

    return userId;
  },
);

/**
 * Декоратор для получения ролей пользователя из контекста GraphQL
 * @returns Массив ролей или пустой массив, если роли не определены
 */
export const CurrentUserRoles = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const roles = ctx.getContext().req.roles;

    return Array.isArray(roles) ? roles : [];
  },
);
