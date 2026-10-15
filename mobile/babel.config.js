module.exports = function (api) {
  api.cache(true)
  // веб-иконки и иллюстрации (../src/components) → react-native-svg, см. scripts/babel-plugin-web-svg.js
  return { presets: ['babel-preset-expo'], plugins: [require.resolve('./scripts/babel-plugin-web-svg.js')] }
}
