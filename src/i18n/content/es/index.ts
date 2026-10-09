import type { ContentPack } from '../types'
import { u1 } from './u1'
import { u2 } from './u2'
import { u3 } from './u3'
import { u4 } from './u4'
import { u5 } from './u5'
import { homework } from './homework'
import { tiers } from './tiers'
import { economy } from './economy'
import { kit } from './kit'

const pack: ContentPack = { units: { u1, u2, u3, u4, u5 }, homework, tiers, economy, kit }
export default pack
