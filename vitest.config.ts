import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		env: {
			NODE_ENV: 'test',
		},
		globals: true,
		include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
		coverage: {
			reporter: ['text', 'html', 'lcov'],
			provider: 'v8',
		},
		setupFiles: ['./tests/setup.ts']
	},
});


