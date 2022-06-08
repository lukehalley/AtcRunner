import { ChainId } from 'constants/sdk-extra'
import { StatKeys } from 'features/heroes/types'
import {
  GetPerformanceDialogueMap,
  Professions,
  QuestKeys,
  QuestProviderKeys,
  QuestType,
  RewardsDialogueMap
} from './types'

export class Quest<T = QuestKeys> {
  key: T
  title: string
  addresses: { [key in ChainId]: string }
  provider: QuestProviderKeys
  type: QuestType
  level: number
  duration: number
  baseStaminaCost: number
  proficientStaminaCost: number
  minHeroes: number
  maxHeroes: number
  startQuestName: string
  tooltipText: string
  prompts: string[]
  location: string
  locationUrl: string
  trainingStat?: StatKeys
  baseDuration?: number
  maxAttempts?: number
  proficientDuration?: number
  proficiencyType?: Professions
  rewardsDialogueMap?: RewardsDialogueMap
  performanceDialogueMap?: GetPerformanceDialogueMap
  sceneImage?: string
  baseOnly?: boolean
  disabled?: boolean
  audio?: string
  constructor(dataMap: {
    key: T
    title: string
    addresses: { [key in ChainId]: string }
    provider: QuestProviderKeys
    type: QuestType
    level: number
    duration: number
    baseStaminaCost: number
    proficientStaminaCost: number
    minHeroes: number
    maxHeroes: number
    startQuestName: string
    tooltipText: string
    prompts: string[]
    location: string
    locationUrl: string
    trainingStat?: StatKeys
    maxAttempts?: number
    baseDuration?: number
    proficientDuration?: number
    proficiencyType?: Professions
    rewardsDialogueMap?: RewardsDialogueMap
    performanceDialogueMap?: GetPerformanceDialogueMap
    sceneImage?: string
    baseOnly?: boolean
    disabled?: boolean
    audio?: string
  }) {
    this.key = dataMap.key
    this.title = dataMap.title
    this.addresses = dataMap.addresses
    this.provider = dataMap.provider
    this.type = dataMap.type
    this.level = dataMap.level
    this.duration = dataMap.duration
    this.baseStaminaCost = dataMap.baseStaminaCost
    this.proficientStaminaCost = dataMap.proficientStaminaCost
    this.minHeroes = dataMap.minHeroes
    this.maxHeroes = dataMap.maxHeroes
    this.startQuestName = dataMap.startQuestName
    this.tooltipText = dataMap.tooltipText
    this.prompts = dataMap.prompts
    this.location = dataMap.location
    this.locationUrl = dataMap.locationUrl
    this.trainingStat = dataMap.trainingStat
    this.maxAttempts = dataMap.maxAttempts
    this.baseDuration = dataMap.baseDuration
    this.proficientDuration = dataMap.proficientDuration
    this.proficiencyType = dataMap.proficiencyType
    this.rewardsDialogueMap = dataMap.rewardsDialogueMap
    this.performanceDialogueMap = dataMap.performanceDialogueMap
    this.sceneImage = dataMap.sceneImage
    this.baseOnly = dataMap.baseOnly
    this.disabled = dataMap.disabled
    this.audio = dataMap.audio
  }
}
