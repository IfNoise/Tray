# Используем многослойную сборку
FROM node:22.12-alpine AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install 

# Копируем остальные файлы приложения
COPY . .

# Собираем приложение NestJS
RUN npm run build

# Создаем финальный образ
FROM node:22.12-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем только необходимые файлы из builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Экспонируем порт приложения
EXPOSE 3000
ENV mode=production

# Создаем непривилегированного пользователя и переключаемся на него
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Команда для запуска приложения
CMD ["node", "dist/main"]