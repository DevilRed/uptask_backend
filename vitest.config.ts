import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
		coverage: {
			reporter: ['text', 'html', 'lcov'],
			provider: 'v8',
		},
	},
});


