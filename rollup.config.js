/**
 * Rollup Configuration
 * Bundles ES6 modules into a single minified file
 */

import terser from '@rollup/plugin-terser';

export default {
  input: 'assets/js/main.js',
  output: {
    file: 'assets/js/bundle.min.js',
    format: 'es',
    sourcemap: true,
    banner: '/* Second Sight Solutions - bundled JS */',
  },
  plugins: [
    terser({
      compress: {
        passes: 2,
        drop_console: false, // Keep console for error logging
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Only remove log/info, keep warn/error
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: /^!/,
      },
    }),
  ],
};
