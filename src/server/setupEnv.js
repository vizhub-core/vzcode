import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { join } from 'node:path';

const dir = fileURLToPath(import.meta.url);
dotenv.config({
  path: join(dir, '../../../.env'),
});
