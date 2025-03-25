import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const token = jwt.sign(
  {
    sub: 'test-user-id',
    resource_access: {
      'oauth2-proxy': {
        roles: ['admin', 'user'],
      },
    },
  },
  process.env.JWT_SECRET || 'dftdfkhjvblhjkgkhfjtjkdkgh',
  { expiresIn: '1h' },
);

console.log('Тестовый токен:');
console.log(token);
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log('\nДекодированный токен:');
console.log(JSON.stringify(decoded, null, 2));
