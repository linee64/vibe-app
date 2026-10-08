const path = require('path')

const webLib = path.resolve(__dirname, '..', 'src', 'lib')

module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@web/(.*)$': '<rootDir>/../src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/__mocks__/@react-native-async-storage/async-storage.js',
  },
  // те же подмены, что в metro.config.js: веб-модули из src/lib получают мобильные адаптеры
  resolver: '<rootDir>/jest.resolver.js',
  rootDir: __dirname,
  roots: ['<rootDir>/src'],
  modulePaths: ['<rootDir>/node_modules'],
  globals: { __WEB_LIB__: webLib },
}
