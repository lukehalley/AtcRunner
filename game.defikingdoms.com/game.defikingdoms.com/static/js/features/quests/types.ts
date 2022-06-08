import { Item } from 'features/items/Item'
import { ItemKeys } from 'features/items/types'
import { Quest } from './Quest'
import { QuestProvider } from './QuestProvider'

export type QuestMap = {
  [key in QuestKeys]: Quest
}

export type QuestProviderMap = {
  [key in QuestProviderKeys]: QuestProvider
}

export type QuestProviderStatusMap = {
  [key in QuestProviderKeys]: QuestProviderStatus
}

export enum QuestProviderStatus {
  Inactive,
  Pending,
  Complete
}

export enum QuestType {
  AttemptBased,
  AttemptBasedTraining,
  LiquidityBased,
  TimeBased
}

export enum QuestKeys {
  FISHING_0 = 'fishing-0',
  FISHING_0_OLD = 'fishing-0-old',
  FORAGING_0 = 'foraging-0',
  FORAGING_0_OLD = 'foraging-0-old',
  GARDENING_0 = 'gardening-0',
  JEWEL_MINING_0 = 'jewel-mining-0',
  GOLD_MINING_0 = 'gold-mining-0',
  WISHING_WELL_0 = 'wishing-well-0',
  WISHING_WELL_0_OLD = 'wishing-well-0-old',
  ARM_WRESTLE = 'arm-wrestle',
  DARTS = 'darts',
  CARDS = 'cards',
  BALL = 'ball',
  DANCING = 'dancing',
  ALCHEMIST_ASSISTANCE = 'alchemist-assistance',
  HELPING_THE_FARM = 'helping-the-farm',
  PUZZLE_SOLVING = 'puzzle-solving'
}

export type ActiveQuest = {
  id: number
  questAddress: string
  heroes: Array<any>
  attempts: number
  completeAtTime: any
  startTime: any
  activeData: any
}

export enum Professions {
  FISHING = 'fishing',
  FORAGING = 'foraging',
  GARDENING = 'gardening',
  MINING = 'mining',
  WISHING_WELL = 'well'
}

export enum QuestProviderKeys {
  FISHER_TOM = 'fisher-tom',
  WOODSMAN_AURUM = 'woodsman-aurum',
  DRUID_LAM = 'druid-lam',
  QUARRYSMITH_GREN = 'quarrysmith-gren',
  WISHING_WELL = 'wishing-well',
  ICE_REAVER_ZAINE = 'ice-reaver',
  LAYLA = 'layla',
  LUCKY_MOE = 'lucky-moe',
  STREET_KID_CARLIN = 'street-kid-carlin',
  ISABELLE = 'isabelle',
  ARNOLD = 'arnold',
  FARMER_QUILL = 'farmer-quill',
  ORVIN = 'orvin'
}

export enum QuestStatus {
  NONE,
  STARTED,
  COMPLETED,
  CANCELED
}

export enum QuestEventTypes {
  CANCELED = 'QuestCanceled',
  COMPLETE = 'QuestCompleted',
  REWARD = 'QuestReward',
  REWARD_MINTED = 'RewardMinted',
  SKILL = 'QuestSkillUp',
  STAMINA = 'QuestStaminaSpent',
  STARTED = 'QuestStarted',
  TRAINING_ATTEMPT = 'TrainingAttemptDone',
  TRAINING_RATIO = 'TrainingSuccessRatio',
  XP = 'QuestXP'
}

export type RewardsDialogueMap = {
  noRewardMessage: string
  questFailedMessage: string
  tearsComboMessage: string
  runesComboMessage: string
  tearsOrRunesOnlyMessage: string
  eggMessage: string
}

export type PerformanceDialogueMap = {
  good: string
  fair: string
  poor: string
  bad: string
}

export type GetPerformanceDialogueMap = (name: string) => PerformanceDialogueMap

export interface Reward extends Item {
  key: ItemKeys
  quantity: number
}

export interface Performance {
  marks: boolean[]
  attempts: number
  winCount: number
}

export type HeroRewardsMap = {
  [index: string]: {
    rewards?: { [index: string]: Reward }
    xpEarned?: number
    skillUp?: { [index: string]: number }
    performance: Performance
  }
}
