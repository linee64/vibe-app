/**
 * Babel-плагин: веб-иллюстрации и иконки (../src/components/*.tsx — inline <svg>, <path>, <rect>…) рисуются в
 * приложении нативно через react-native-svg без копирования. В файлах веб-исходников строчные SVG-теги
 * заменяются на компоненты react-native-svg (<svg> → <Svg>, <path> → <Path> …), импорт добавляется сам.
 * Атрибуты у SVG и react-native-svg совпадают (fill, stroke, strokeWidth, transform, opacity, currentColor через color).
 * Так Бипи, вещи гардероба, иконки навигации/экономики и иллюстрации разделов — один источник правды с вебом.
 */
const path = require('path')

const WEB_SRC = path.resolve(__dirname, '..', '..', 'src') + path.sep

const TAGS = {
  svg: 'Svg',
  path: 'Path',
  circle: 'Circle',
  rect: 'Rect',
  g: 'G',
  ellipse: 'Ellipse',
  line: 'Line',
  polyline: 'Polyline',
  polygon: 'Polygon',
  defs: 'Defs',
  linearGradient: 'LinearGradient',
  radialGradient: 'RadialGradient',
  stop: 'Stop',
  clipPath: 'ClipPath',
  mask: 'Mask',
  pattern: 'Pattern',
  use: 'Use',
  symbol: 'Symbol',
  text: 'Text',
  tspan: 'TSpan',
}

module.exports = function webSvgToNative({ types: t }) {
  return {
    name: 'vaibik-web-svg-to-native',
    visitor: {
      Program(program, state) {
        const file = state.filename || (state.file && state.file.opts.filename) || ''
        if (!file.startsWith(WEB_SRC) || !/\.tsx$/.test(file)) return
        const used = new Map()
        const local = (tag) => {
          if (!used.has(tag)) used.set(tag, program.scope.generateUidIdentifier('RNSvg' + TAGS[tag]).name)
          return used.get(tag)
        }
        const rename = (namePath) => {
          const node = namePath.node
          if (!t.isJSXIdentifier(node) || !Object.prototype.hasOwnProperty.call(TAGS, node.name)) return
          namePath.replaceWith(t.jsxIdentifier(local(node.name)))
        }
        program.traverse({
          JSXOpeningElement(p) {
            rename(p.get('name'))
          },
          JSXClosingElement(p) {
            rename(p.get('name'))
          },
        })
        if (!used.size) return
        const specifiers = [...used].map(([tag, id]) => t.importSpecifier(t.identifier(id), t.identifier(TAGS[tag])))
        program.unshiftContainer('body', t.importDeclaration(specifiers, t.stringLiteral('react-native-svg')))
      },
    },
  }
}

module.exports.WEB_SRC = WEB_SRC
