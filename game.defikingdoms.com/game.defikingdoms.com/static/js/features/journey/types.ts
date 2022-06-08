import { BigNumber } from 'ethers'
import { Item } from 'features/items/Item'
import { Hero } from 'utils/dfkTypes'

export enum JourneyEventTypes {
  HERO_CLAIMED = 'HeroClaimed'
}

export type RawActiveJourney = {
  id: BigNumber
  heroId: BigNumber
  groupId: BigNumber
  addedSurvivalChance: boolean
  owner: string
  startBlock: BigNumber
}

export type ActiveJourney = {
  id: number
  hero: Hero
  groupId: number
  startBlock: number
  addedSurvivalChance: boolean
}

export type PerilousJourneyHeroWithRewards = {
  tokenQuantity: number
  raffleTicketQuantity: number
  rewardItems: Array<{ item: Item; quantity: number }>
  heroData: Hero
}

export type JourneyGroup = {
  id: number
  journies: ActiveJourney[]
}

export type BoostedHeroData = {
  oldHero: any
  newHero: any
  statList: BoostStatIncrease[]
}

export type BoostStatIncrease = {
  stat: { name: string; abbr: string }
  increase: number
}
