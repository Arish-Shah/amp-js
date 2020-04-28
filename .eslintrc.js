module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': 0,
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  }
};
