import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
export default {
  input: './index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    babel({
      presets: ['@babel/preset-env'],
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    terser({
      compress: {
        keep_infinity: true,
        pure_getters: true,
        passes: 10,
      },
      ecma: 2016,
      toplevel: false,
      format: {
        comments: 'all',
      },
    }),
  ],
};
