import babel from 'rollup-plugin-babel';

export default {
  input: 'src/amp.js',
  output: [
    {
      file: 'amp.bundled.js',
      format: 'esm'
    }
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
