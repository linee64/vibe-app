import type { TiersTr } from '../types'

export const tiers: TiersTr = {
  tiers: {
    novice: { name: 'Beginner', outcome: 'Give AI clear tasks and build your first landing page', skills: ['A 5-part prompt', 'A landing page in one evening', 'Edits through clarifications'] },
    mid: { name: 'Intermediate', outcome: 'Fix bugs together with AI and connect a database to your app', skills: ['Debugging from the error', 'Tables and forms', 'Keeping keys secret'] },
    pro: { name: 'Advanced', outcome: 'Put your project online on your own domain and find your first users', skills: ['GitHub and deploy', 'Your own domain', 'Analytics'] },
  },
  soon: ['AI agents', 'Payments in your own app'],
}
