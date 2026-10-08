const path = require('path')

const webSrc = path.resolve(__dirname, '..', 'src')
const adapters = path.resolve(__dirname, 'src', 'lib', 'web-adapters')
const ADAPTERS = {
  [path.join(webSrc, 'lib', 'config')]: path.join(adapters, 'config.ts'),
  [path.join(webSrc, 'lib', 'supabase')]: path.join(adapters, 'supabase.ts'),
}

module.exports = (request, options) => {
  if (request.startsWith('.') && options.basedir.startsWith(webSrc + path.sep)) {
    const adapter = ADAPTERS[path.resolve(options.basedir, request)]
    if (adapter) return adapter
  }
  return options.defaultResolver(request, options)
}
