import type { TiersTr } from '../types'

export const tiers: TiersTr = {
  tiers: {
    novice: { name: 'Principiante', outcome: 'Darle tareas claras a la IA y armar tu primera landing', skills: ['Prompt de 5 partes', 'Una landing en una tarde', 'Ajustes con aclaraciones'] },
    mid: { name: 'Intermedio', outcome: 'Arreglar bugs junto con la IA y conectar una base de datos a tu app', skills: ['Depurar a partir del error', 'Tablas y formularios', 'Claves en secreto'] },
    pro: { name: 'Avanzado', outcome: 'Publicar tu proyecto en internet, crear una app móvil y sumar funciones de IA y agentes a tu producto', skills: ['Deploy y dominio propio', 'Diseño y app móvil', 'Funciones de IA y agentes'] },
  },
  soon: ['Pagos y suscripciones en tu propia app', 'Tu propio SaaS: de la idea a los primeros ingresos'],
}
