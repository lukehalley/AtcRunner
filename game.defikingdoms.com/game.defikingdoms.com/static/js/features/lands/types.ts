import { BigNumber } from 'ethers'
import { Profile } from 'features/profile/types'

export type Land = {
  [index: string]: number | string | Profile | null
  id: number
  level: number
  name: string
  owner: Profile | null
  region: number
  steward: number
  startingPrice: number
  endingPrice: number
  seller: string | null
}

export type RawLand = {
  landId: BigNumber
  level: number
  name: string
  owner: string
  region: BigNumber
  score: BigNumber
  steward: BigNumber
}

export type Region = {
  id: number
  name: string
  landIds: number[]
}

export type LandFilters = {
  [index: string]: any
  lid: string
  status: string[]
  resources: string[]
  regions: string[]
}

export type LandSorting = {
  field: string
  direction: string
  type: string
}

export enum LandHubType {
  VIEW = 'view',
  USER = 'user',
  SELL = 'sell',
  BUY = 'buy'
}

export type LandAuctionData = {
  startingPrice: number
  endingPrice: number
  seller: string | null
}
