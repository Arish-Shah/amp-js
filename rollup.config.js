import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/amp.js',
      format: 'esm'
    },
    {
      file: 'dist/amp.min.js',
      format: 'esm',
      plugins: [terser()]
    }
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
