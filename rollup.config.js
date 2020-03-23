import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'amp.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'amp.min.js',
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
