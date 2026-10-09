import type { TiersTr } from '../types'

export const tiers: TiersTr = {
  tiers: {
    novice: { name: 'Principiante', outcome: 'Darle tareas claras a la IA y armar tu primera landing', skills: ['Prompt de 5 partes', 'Una landing en una tarde', 'Ajustes con aclaraciones'] },
    mid: { name: 'Intermedio', outcome: 'Arreglar bugs junto con la IA y conectar una base de datos a tu app', skills: ['Depurar a partir del error', 'Tablas y formularios', 'Claves en secreto'] },
    pro: { name: 'Avanzado', outcome: 'Publicar tu proyecto en internet con tu propio dominio y encontrar a tus primeros usuarios', skills: ['GitHub y deploy', 'Tu propio dominio', 'Analítica'] },
  },
  soon: ['Agentes de IA', 'Pagos en tu propia app'],
}
