import levelup from 'levelup';
import leveldown from 'leveldown';
import path from 'node:path';

import { DB_PATH } from 'helpers/constants';

const dbPath = path.resolve(process.env.WORKSPACE_PATH, DB_PATH);

export const storage = levelup(leveldown(dbPath));
