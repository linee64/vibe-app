/**
 * Metro: общий код с веб-версией.
 * - `@web/*` → ../src/* (контент курса, логика упражнений, экономика, симуляторы домашек — один источник правды).
 * - Веб-модули из ../src/lib, которые трогают браузер/Vite (config.ts с import.meta.env, supabase.ts),
 *   подменяются тонкими адаптерами из mobile/src/lib/web-adapters. Веб-файлы не меняются.
 */
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const webSrc = path.resolve(projectRoot, '..', 'src')
const adapters = path.resolve(projectRoot, 'src', 'lib', 'web-adapters')

/** Абсолютный путь веб-модуля (без расширения) → адаптер */
const ADAPTERS = {
  [path.join(webSrc, 'lib', 'config')]: path.join(adapters, 'config.ts'),
  [path.join(webSrc, 'lib', 'supabase')]: path.join(adapters, 'supabase.ts'),
}

const config = getDefaultConfig(projectRoot)
config.watchFolders = [webSrc]
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')]

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@web/')) {
    return context.resolveRequest(context, path.join(webSrc, moduleName.slice('@web/'.length)), platform)
  }
  if (moduleName.startsWith('.') && context.originModulePath.startsWith(webSrc + path.sep)) {
    const target = path.resolve(path.dirname(context.originModulePath), moduleName)
    const adapter = ADAPTERS[target]
    if (adapter) return { type: 'sourceFile', filePath: adapter }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
