import { afterAll, beforeAll } from 'vitest';
import { config } from 'dotenv';
import { connectDB, closeDB } from '../src/config/db';
import { clearAllCollections } from './utils/db-utils';

// Load environment variables from .env file
config();

beforeAll(async () => {
	await connectDB();
	await clearAllCollections(); // Start with a clean slate
});

afterAll(async () => {
	await clearAllCollections(); // Optional: Clean up after tests
	await closeDB();
});