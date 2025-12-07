import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from backend root (two levels up from scripts/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
