import type { TiersTr } from '../types'

export const tiers: TiersTr = {
  tiers: {
    novice: { name: 'Beginner', outcome: 'Give AI clear tasks and build your first landing page', skills: ['A 5-part prompt', 'A landing page in one evening', 'Edits through clarifications'] },
    mid: { name: 'Intermediate', outcome: 'Fix bugs together with AI and connect a database to your app', skills: ['Debugging from the error', 'Tables and forms', 'Keeping keys secret'] },
    pro: { name: 'Advanced', outcome: 'Launch your project online, build a mobile app and add AI features and agents to your product', skills: ['Deploy and your own domain', 'Design and a mobile app', 'AI features and agents'] },
  },
  soon: ['Payments and subscriptions in your own app', 'Your own SaaS: from idea to first revenue'],
}
