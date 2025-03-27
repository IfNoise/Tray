// Скрипт инициализации для создания пользователя с ограниченными правами для приложения
const rootUsername = cat('/run/secrets/mongo_root_username');
const rootPassword = cat('/run/secrets/mongo_root_password');
const appUsername = cat('/run/secrets/mongo_user_username');
const appPassword = cat('/run/secrets/mongo_user_password');

// Подключение от имени root
const conn = new Mongo();
const adminDb = conn.getDB('admin');
adminDb.auth(rootUsername, rootPassword);

// Создание базы данных приложения и коллекций
const appDb = conn.getDB('tray');

// Создание пользователя с правами только на базу данных приложения
appDb.createUser({
  user: appUsername,
  pwd: appPassword,
  roles: [{ role: 'readWrite', db: 'tray' }],
});

print('MongoDB инициализация успешно выполнена!');
