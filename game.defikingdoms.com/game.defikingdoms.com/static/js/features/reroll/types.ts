import { Item } from 'features/items/Item'
import { ItemKeys } from 'features/items/types'
import { Hero } from 'utils/dfkTypes'

export enum RerollStatus {
  NONE,
  STARTED,
  COMPLETED
}

export enum RerollChoices {
  GAME_GENES,
  APPEARANCE_GENES,
  BOTH_GENES
}

export enum RerollEventTypes {
  HeroReroll = 'HeroReroll',
  SummonsReset = 'SummonsReset',
  RewardMinted = 'RewardMinted',
  StatUp = 'StatUp',
  XpUp = 'XpUp'
}

export type RewardItem = {
  item: Item<ItemKeys>
}

export type Stat = {
  stat: string
  increase: number
}

export type Rewards = {
  hero?: {
    before: Hero
    after: Hero
    choice: RerollChoices
  }
  summons?: {
    oldSummonCount: number
    newSummonCount: number
  }
  items: RewardItem[]
  stats: Stat[]
  xp?: number
}
