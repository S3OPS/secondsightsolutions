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
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
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
