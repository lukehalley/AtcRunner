import { ChainId } from 'constants/sdk-extra'
import { BigNumber } from 'ethers'
import { Item } from 'features/items/Item'
import { Ingredient } from 'features/items/types'
import { DateTime } from 'luxon'
import { RangeValue, YesOrNo } from 'utils/api/types'
import { Pet } from './Pet'

export type PetDataLabels = [
  'season',
  'appearanceId',
  'family',
  'displayName',
  'variant',
  'rarity',
  'pool',
  'credits',
  'path'
]

export enum PetEventTypes {
  CRACKED = 'EggCracked'
}

export enum ActiveViewerTab {
  PET_CATALOG,
  MY_PETS
}

export type ActiveIncubation = {
  id: number
  eggType: EggType
  finishTime: DateTime
}

export type EggSelect = {
  item: Item
  images: { active: string; inactive: string; locked: string }
  cost: Ingredient[]
  eggTypeIndex: EggType
  locked?: boolean
}

export type RarityChance = {
  rarity: string
  chance: string
}

export type OfferingSelect = {
  baseImage: string
  bannerImage: string
  name: string
  description?: string
  cost: Ingredient[]
  incubationTime: string
  shinyChance: string
  tierIndex: number
  rarityChances: RarityChance[]
}

export enum Season {
  ONE = 1
}

export enum OriginId {
  SERENDALE = 0,
  CRYSTALVALE = 1
}

export enum SkillBonus {
  ONE = 1,
  TWO = 80,
  THREE = 160
}

export enum EggType {
  BLUE,
  GREY
  // YELLOW,
  // GOLD
}

export enum FamilyType {
  AXOLOTLS = 'Axolotls',
  BASILISKS = 'Basilisks',
  BLOATERS = 'Bloaters',
  BLUBS = 'Blubs',
  BOARS = 'Boars',
  CAEDORIS = 'Caedoris',
  CERBERUS = 'Cerberus',
  CLAMS = 'Clams',
  CORGIS = 'Corgis',
  CRABS = 'Crabs',
  DRAGONFLIES = 'Dragonflies',
  DRAGONLINGS = 'Dragonlings',
  EMBERLINGS = 'Emberlings',
  ENTS = 'Ents',
  FAE = 'Fae',
  DEER = 'Deer',
  FISH = 'Fish',
  FROGS = 'Frogs',
  GAERON_WHELPS = 'Gaeron Whelps',
  GEESE = 'Geese',
  HECHUS = 'Hechus',
  HIGHLANDS_WHELPS = 'Highlands Whelps',
  HYDRAS = 'Hydras',
  LEVIATHANS = 'Leviathans',
  MERFOLK = 'Merfolk',
  MOSSFOLK = 'Mossfolk',
  PENGUINS = 'Penguins',
  PET_ROCKS = 'Pet Rocks',
  RIVERHOLD_WHELPS = 'Riverhold Whelps',
  SHRUBBLERS = 'Shrubblers',
  SNAILS = 'Snails',
  SNOWMEN = 'Snowmen',
  STARFISH = 'Starfish',
  STARLIGHT_BUTTERFLIES = 'Starlight Butterflies',
  TENTICKLERS = 'Tenticklers',
  TOADS = 'Toads',
  TOGWAS = 'Togwas',
  TURTLES = 'Turtles',
  WARLOCTOPUS_AND_SQUID_ORACLE = 'Warloctopus and Squid Oracle',
  WOLVES = 'Wolves'
}

export enum Rarity {
  COMMON,
  UNCOMMON,
  RARE,
  LEGENDARY,
  MYTHIC
}

export enum Elements {
  FIRE,
  WATER,
  EARTH,
  WIND,
  LIGHTNING,
  ICE,
  LIGHT,
  DARK
}

export enum Creators {
  ANONYMOUS = 'anonymous',
  SECONDBESTDAD = 'secondbestdad',
  ATLAS = 'atlasparker',
  FEZZ = 'fezz'
}

export type CreditMap = {
  [key in Creators]: {
    name: string
    link?: string
  }
}

export enum Backgrounds {
  STILLWOOD_MEADOW,
  FOREST_TRAIL,
  SWAMP_OF_EOXIS,
  VITHRAVEN_OUTSKIRTS,
  PATH_OF_FIRE,
  REYALIN_MOUNTAIN_PASS,
  ADELYN_SIDE_STREET,
  BLOATER_FALLS,
  HAYWOOD__FARMSTEAD,
  INNER_GROVE,
  VUHLMIRA_RUINS
}

export type PetMap = {
  [index in Season]: {
    [index in EggType]: {
      [key: number]: Pet
    }
  }
}

export type ChainIdKey = { [key in ChainId]: string }

export interface Request {
  pets: ChainIdKey
  salesAuctions: ChainIdKey
}

export interface Order {
  by?: string
  dir: string
}

export interface ValueMap {
  [key: string]: boolean
}

export type MinMax = [number, number]

export interface FilterStat {
  field: string
  values?: RangeValue
}

export enum FilterType {
  basic = 'basic'
}

export type BasicFilters = {
  id: string
  bonusCount: MinMax
  price: MinMax
  rarity: MinMax
  combat: ValueMap
  crafting: ValueMap
  gathering: ValueMap
  shiny: ValueMap
  status: ValueMap
}

export type BasicFilterKeys = keyof BasicFilters

export interface FilterMap {
  [FilterType.basic]: BasicFilters
}

export interface CorePet {
  appearance: number
  background: number
  bonusCount: number
  combatBonus: number
  combatBonusScalar: number
  craftBonus: number
  craftBonusScalar: number
  eggType: number
  element: number
  equippableAt: BigNumber
  equippedTo: BigNumber
  hungryAt: BigNumber
  id: BigNumber
  name: string
  originId: number
  profBonus: number
  profBonusScalar: number
  rarity: number
  season: number
  shiny: number
}

export interface PetData {
  id: string
  owner: string
  owner_name: string
  owner_picid: string
  owner_address: string
  owner_nftid: string
  owner_collectionid: string
  previousowner: string
  privateauctionprofile: string | null
  creator: string
  name: string
  season: Season
  eggtype: EggType
  rarity: Rarity
  element: Elements
  bonuscount: number
  profbonus: number
  profbonusscalar: number
  craftbonus: number
  craftbonusscalar: number
  combatbonus: number
  combatbonusscalar: number
  appearance: number
  background: Backgrounds
  shiny: number
  hungryat: string
  equippableat: string
  equippedto: string | null
  saleauction: number | null
  saleprice: number | null
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

export interface Params {
  id?: string | string[]
  owner?: string
  previousowner?: string
  bonusCount?: RangeValue
  status?: string
  shiny?: YesOrNo
  gathering?: number[]
  crafting?: number[]
  combat?: string[]
  other?: number[]
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
}

export interface GetUserPetsPayload extends GetPetsPayload {
  account: string | null | undefined
  chainId?: ChainId
}

export interface GetPetsPayload {
  account?: string | null | undefined
  chainId?: ChainId
  params?: Params
  offset?: number
  order?: Order
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

export interface ThunkPetsPayload {
  data: PetData[]
  length: number
}

export interface PetsDataPayload {
  data: PetData[]
  length: number
}
