module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 6,
    },
    extends: [
        'airbnb'
    ],
    plugins: [
        'promise',
    ],
    rules: {
      'no-console': 0,
    },
};