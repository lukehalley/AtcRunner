import { ChainId } from 'constants/sdk-extra'
import { BigNumber } from 'ethers'
import { defaultHeroFilters, elements, genders, professions } from 'features/heroes/constants'
import { backgrounds } from 'polished'
import { RangeValue, YesOrNo } from 'utils/api/types'
import { Hero } from 'utils/dfkTypes'
import { classes, statBoosts, statsAbbreviationMap } from './constants'

export type ChainIdKey = { [key in ChainId]: string }

export interface Request {
  heroes: ChainIdKey
  salesAuctions: ChainIdKey
  assistAuctions: ChainIdKey
}

export type ClassKeys = keyof typeof classes
export type ClassValues = typeof classes[ClassKeys]
export type ProfessionKeys = keyof typeof professions
export type ProfessionValues = typeof professions[ProfessionKeys]
export type BackgroundKeys = keyof typeof backgrounds
export type BackgroundValues = typeof backgrounds[BackgroundKeys]
export type StatKeys = keyof typeof statsAbbreviationMap
export type StatBoostKeys = keyof typeof statBoosts
export type StatBoostValues = typeof statBoosts[StatBoostKeys]
export type ElementKeys = keyof typeof elements
export type ElementValues = typeof elements[ElementKeys]
export type Gender = 'male' | 'female'
export type GenderKeys = keyof typeof genders
export type GenderValues = typeof genders[GenderKeys]

export interface Order {
  by?: string
  dir: 'asc' | 'desc'
}

export interface FilterStat {
  field: string
  values?: RangeValue
}

export interface HeroData {
  strengthgrowthp: number
  intelligencegrowthp: number
  wisdomgrowthp: number
  luckgrowthp: number
  agilitygrowthp: number
  vitalitygrowthp: number
  endurancegrowthp: number
  dexteritygrowthp: number
  strengthgrowths: number
  intelligencegrowths: number
  wisdomgrowths: number
  luckgrowths: number
  agilitygrowths: number
  vitalitygrowths: number
  endurancegrowths: number
  dexteritygrowths: number
  agility: number
  assistantid: BigInt
  assistauction_duration: number
  assistauction_endingprice: number
  assistauction_startedat: number
  assistauction_startingprice: number
  assistingprice: number
  currentquest: string
  current_stamina: number
  dexterity: number
  endurance: number
  firstname: number
  firstname_string: string
  fishing: number
  foraging: number
  gardening: number
  generation: number
  hp: number
  id: BigNumber | string
  intelligence: number
  lastname: number
  lastname_string: string
  level: number
  luck: number
  maxsummons: number
  mining: number
  mp: number
  network?: CurrentNetwork
  originrealm?: OriginRealm
  nextsummontime: BigNumber
  owner_address: string
  owner_created: number
  owner_name: string
  owner_picid: number
  owner: string
  pjstatus: 'ON_JOURNEY' | 'SURVIVED' | 'DIED' | null
  pjlevel: number
  pjowner: string
  pjclaimstamp: number
  privateauctionprofile: BigNumber | string | null
  rarity: number
  saleauction: string
  saleauction_duration: number
  saleauction_endingprice: number
  saleauction_startedat: number
  saleauction_startingprice: number
  saleprice: number
  shiny: string
  shinystyle: number
  stamina: number
  staminafullat: BigNumber
  statgenes: BigNumber
  strength: number
  summonedtime: BigNumber
  summonerid: BigInt
  summons: number
  summonsRemaining: number
  visualgenes: BigNumber
  vitality: number
  winner: BigNumber | string | null
  wisdom: number
  xp: BigNumber
}

export interface Params {
  id?: string | string[]
  owner?: string
  previousowner?: string
  gender?: GenderValues[]
  element?: ElementValues[]
  shiny?: YesOrNo[]
  mainClass?: ClassValues[]
  subClass?: ClassValues[]
  profession?: ProfessionValues[]
  background?: BackgroundValues[]
  statBoost1?: StatKeys[]
  statBoost2?: StatKeys[]
  generation?: RangeValue
  level?: RangeValue
  summonsRemaining?: RangeValue
  rarity?: RangeValue
  saleprice?: RangeValue
  assistingprice?: RangeValue
  pjstatus?: string
  pjlevel?: number
  pjowner?: string
  privateauctionprofile?: string
  stats?: FilterStat[]
  skills?: FilterStat[]
  limit?: number
  network?: CurrentNetwork
  originrealm?: OriginRealm
}

export interface GetUserHeroesPayload extends GetHeroesPayload {
  account: string | null | undefined
  chainId?: ChainId
}

export interface GetHeroesPayload {
  account?: string | null | undefined
  chainId?: ChainId
  params?: Params
  offset?: number
  order?: Order
}

export interface HeroesDataPayload {
  data: HeroData[]
  length: number
}

export interface ThunkHeroesPayload {
  data: Hero[]
  length: number
}

export interface AuctionData {
  id: string
  tokenid: string
  startedat: number
  endedat: number
  duration: number
  purchaseprice: number
  startingprice: number
  endingprice: number
  seller_address: string
  seller_name: string
  seller_picid: number
  seller: string
  winner: string
}

export interface GetAuctionsPayload {
  params?: {
    id?: string[]
    open?: boolean
    tokenId?: string
    seller?: string
  }
  offset?: number
  order?: Order
}

export interface HeroPayload {
  heroFilters: typeof defaultHeroFilters
  cardsPerPage: number
  currentPage: number
  sortBy: string
  sortDirection: string
}

export interface HeroSaleHistoryPayload {
  tokenId: string
}

export interface HeroLineagePayload {
  id: string
}

export enum CurrentNetwork {
  HARMONY = 'hmy',
  DFK_CHAIN = 'dfk'
}

export enum OriginRealm {
  CRYSTALVALE = 'CRY',
  SERENDALE = 'SER'
}

export enum SaleOrRent {
  sale = 'saleAuctions',
  rent = 'assistingAuctions'
}

export interface PurchaseHistoryPayload {
  chainId?: ChainId
  account?: string | null
  saleOrRent: SaleOrRent
  skip?: number
  onlyOwner?: boolean
}
