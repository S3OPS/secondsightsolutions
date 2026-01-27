import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom environment for browser-like testing
    environment: 'jsdom',
    
    // Test file patterns
    include: ['test/**/*.test.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['assets/js/modules/**/*.js'],
      exclude: [
        'assets/js/modules/analytics.js', // External service
        'assets/js/modules/performance.js', // Browser API dependent
      ],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
    },
    
    // Global test timeout
    testTimeout: 10000,
    
    // Reporter configuration
    reporters: ['default'],
  },
});
