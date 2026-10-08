const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.expo/*', 'coverage/*'] },
  {
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^@web/'] }],
    },
  },
])
