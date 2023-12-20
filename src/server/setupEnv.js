import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { join } from 'node:path';

const dir = fileURLToPath(import.meta.url);
dotenv.config({
  path: join(dir, '../../../.env'),
});
if (process.env.DEBUG_SETUP_ENV) {
  console.log(
    'environment variables set up',
    Object.fromEntries(
      Object.entries(process.env).filter(
        (entry) => !entry[0].endsWith('PATH'),
      ),
    ),
  );
}
