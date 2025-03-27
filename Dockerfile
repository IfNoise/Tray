# Используем конкретную версию Node.js с Alpine для минимального размера образа
FROM node:22.12-alpine AS deps

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости, используя npm ci для точного воспроизведения package-lock.json
# Убираем лишние данные для уменьшения размера образа
RUN npm ci --only=production && \
    npm cache clean --force

# Сборка приложения
FROM node:22.12-alpine AS builder
WORKDIR /usr/src/app

# Копируем файлы зависимостей и устанавливаем ВСЕ зависимости, включая devDependencies
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Запускаем сборку приложения
RUN npm run build && \
    npm prune --production

# Финальный образ для запуска
FROM node:22.12-alpine AS runner
WORKDIR /usr/src/app

# Добавляем метаданные к образу
LABEL maintainer="Your Name <your.email@example.com>"
LABEL description="NestJS Tray Application"
LABEL version="1.0"

# Устанавливаем переменные среды для работы приложения
ENV NODE_ENV=production
ENV TZ=UTC

# Копируем только необходимые файлы из предыдущих этапов
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./

# Копируем graphql схемы, которые могут потребоваться для работы приложения
COPY --from=builder /usr/src/app/src/**/*.graphql ./dist/

# Создаем непривилегированного пользователя
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app

# Переключаемся на непривилегированного пользователя
USER appuser

# Экспонируем порт приложения (из main.ts видно что используется порт 3080)
EXPOSE 3080

# Настраиваем healthcheck для проверки работоспособности приложения
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3080/ || exit 1

# Определяем точку входа
ENTRYPOINT ["node"]

# Запускаем приложение
CMD ["dist/main"]