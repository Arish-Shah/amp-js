import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'amp.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
