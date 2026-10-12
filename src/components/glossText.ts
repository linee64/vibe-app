/** Подписи терминов словарика (UI-каталоги gloss.<id>.term / .def) */
import type { GlossId } from '../data/glossary'
import { t, type UIKey } from '../i18n/core'

export const glossTerm = (id: GlossId) => t(`gloss.${id}.term` as UIKey)
export const glossDef = (id: GlossId) => t(`gloss.${id}.def` as UIKey)
