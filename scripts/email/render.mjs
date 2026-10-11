/**
 * Мини-рендерер Go-шаблонов — ровно то подмножество, что используют supabase/templates/*.html:
 * {{ .A.B }}, {{ $x }}, {{ $x := … }}, {{ $x = … }}, if / else if / else / end, with, eq, or, and,
 * not, printf "%v", обрезка пробелов {{- -}}. Значения экранируются как HTML.
 * Только для превью и тестов: на проде шаблоны рендерит сам Supabase (Go html/template).
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&#34;', "'": '&#39;' }
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c])

function tokenize(src) {
  const re = /\{\{(-\s)?([\s\S]*?)(\s-)?\}\}/g
  const out = []
  let last = 0
  let m
  while ((m = re.exec(src))) {
    out.push({ t: 'text', v: src.slice(last, m.index) })
    out.push({ t: 'act', v: m[2].trim(), ltrim: !!m[1], rtrim: !!m[3] })
    last = re.lastIndex
  }
  out.push({ t: 'text', v: src.slice(last) })
  for (let i = 0; i < out.length; i++) {
    if (out[i].t !== 'act') continue
    if (out[i].ltrim && out[i - 1]) out[i - 1].v = out[i - 1].v.replace(/\s+$/, '')
    if (out[i].rtrim && out[i + 1]) out[i + 1].v = out[i + 1].v.replace(/^\s+/, '')
  }
  return out
}

/** Дерево: { kind: 'text'|'out'|'set'|'if'|'with', … } */
function parse(tokens) {
  let i = 0
  function block(stops) {
    const nodes = []
    while (i < tokens.length) {
      const tk = tokens[i]
      if (tk.t === 'text') {
        if (tk.v) nodes.push({ kind: 'text', v: tk.v })
        i++
        continue
      }
      const a = tk.v
      if (stops.some((s) => a === s || a.startsWith(s + ' '))) return nodes
      i++
      if (a.startsWith('/*')) continue
      let m
      if ((m = /^if\s+(.+)$/.exec(a)) || (m = /^with\s+(.+)$/.exec(a))) {
        const kind = a.startsWith('if') ? 'if' : 'with'
        const branches = [{ cond: m[1], body: block(['else', 'end']) }]
        let elseBody = null
        while (tokens[i] && tokens[i].v !== 'end') {
          const e = tokens[i++].v
          const em = /^else\s+if\s+(.+)$/.exec(e)
          if (em) branches.push({ cond: em[1], body: block(['else', 'end']) })
          else elseBody = block(['end'])
        }
        if (!tokens[i]) throw new Error(`нет {{ end }} для {{ ${a} }}`)
        i++
        nodes.push({ kind, branches, elseBody })
      } else if ((m = /^(\$\w+)\s*(:?=)\s*(.+)$/.exec(a))) {
        nodes.push({ kind: 'set', name: m[1], expr: m[3] })
      } else {
        nodes.push({ kind: 'out', expr: a })
      }
    }
    if (stops.length) throw new Error(`шаблон оборвался, ждали ${stops.join('/')}`)
    return nodes
  }
  return block([])
}

function lex(expr) {
  const re = /\s*("(?:[^"\\]|\\.)*"|\(|\)|[^\s()]+)/g
  const out = []
  let m
  while ((m = re.exec(expr))) if (m[1]) out.push(m[1])
  return out
}

const truthy = (v) => !(v === undefined || v === null || v === false || v === 0 || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length))

function evaluate(expr, dot, vars) {
  const toks = lex(expr)
  let p = 0
  function term() {
    const tk = toks[p++]
    if (tk === '(') {
      const v = call()
      if (toks[p++] !== ')') throw new Error(`нет ")" в ${expr}`)
      return v
    }
    if (tk.startsWith('"')) return JSON.parse(tk)
    if (/^-?\d+(\.\d+)?$/.test(tk)) return Number(tk)
    if (tk === '.') return dot
    if (tk.startsWith('$')) {
      const [name, ...path] = tk.split('.')
      if (!(name in vars)) throw new Error(`неизвестная переменная ${name}`)
      return path.reduce((o, k) => (o == null ? undefined : o[k]), vars[name])
    }
    if (tk.startsWith('.')) return tk.slice(1).split('.').reduce((o, k) => (o == null ? undefined : o[k]), dot)
    return { fn: tk }
  }
  function call() {
    const head = term()
    if (!head || typeof head !== 'object' || !('fn' in head)) return head
    const args = []
    while (p < toks.length && toks[p] !== ')') args.push(term())
    switch (head.fn) {
      case 'eq':
        return args.slice(1).some((a) => a === args[0])
      case 'ne':
        return args[0] !== args[1]
      case 'or':
        return args.find(truthy) ?? args[args.length - 1]
      case 'and':
        return args.find((a) => !truthy(a)) ?? args[args.length - 1]
      case 'not':
        return !truthy(args[0])
      case 'printf':
        if (args[0] !== '%v') throw new Error('printf: поддерживается только "%v"')
        return args[1] == null ? '<no value>' : String(args[1])
      default:
        throw new Error(`функция ${head.fn} не поддерживается`)
    }
  }
  return call()
}

function exec(nodes, dot, vars) {
  let s = ''
  for (const n of nodes) {
    if (n.kind === 'text') s += n.v
    else if (n.kind === 'set') vars[n.name] = evaluate(n.expr, dot, vars)
    else if (n.kind === 'out') {
      const v = evaluate(n.expr, dot, vars)
      s += v == null ? '' : escapeHtml(v)
    } else {
      let done = false
      for (const b of n.branches) {
        const v = evaluate(b.cond, dot, vars)
        if (truthy(v)) {
          s += exec(b.body, n.kind === 'with' ? v : dot, vars)
          done = true
          break
        }
      }
      if (!done && n.elseBody) s += exec(n.elseBody, dot, vars)
    }
  }
  return s
}

/** Отрендерить Go-шаблон с данными как у Supabase ({ ConfirmationURL, Email, Data: user_metadata, … }) */
export function renderGoTemplate(src, data) {
  return exec(parse(tokenize(src)), data, { $: data })
}
