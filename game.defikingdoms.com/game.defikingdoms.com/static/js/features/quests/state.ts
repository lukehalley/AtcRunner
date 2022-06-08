import { createSlice } from '@reduxjs/toolkit'
import { ZERO_ADDRESS } from 'constants/index'
import { StakingInfo } from 'features/stake/hooks'
import uniqBy from 'lodash/uniqBy'
import { Hero } from 'utils/dfkTypes'
import { Quest } from './Quest'
import { QuestProvider } from './QuestProvider'
import { questMap, questProviderMap } from './constants'
import {
  ActiveQuest,
  HeroRewardsMap,
  QuestKeys,
  QuestProviderKeys,
  QuestProviderStatusMap,
  QuestType,
  QuestProviderStatus
} from './types'

interface SkillUp {
  profession: string
  points: number
}

interface QuestSliceState {
  heroQuantityRequired: number
  questType: QuestType
  heroRewardsMap: HeroRewardsMap
  questFailed: boolean
  rewardQuestData: ActiveQuest | null
  rewardedHeroCount: number
  selectedHeroes: Hero[]
  selectedGarden: StakingInfo | null
  xpQuantity: number
  skillUp: SkillUp | null
  showQuestGardenSelector: boolean
  showQuestManagementModal: boolean
  showQuestProviderModal: boolean
  activeQuests: ActiveQuest[]
  questData: Quest
  questProviderStatusMap: QuestProviderStatusMap
  questProviderData: QuestProvider
  questRewardAddress: string
  questManagementTabIndex: number
  showQuestRewardModal: boolean
  showActiveQuestModal: boolean
}

const questProviderStatusMap = {
  [QuestProviderKeys.ARNOLD]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.DRUID_LAM]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.FARMER_QUILL]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.FISHER_TOM]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.ICE_REAVER_ZAINE]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.ISABELLE]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.LAYLA]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.LUCKY_MOE]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.ORVIN]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.QUARRYSMITH_GREN]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.STREET_KID_CARLIN]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.WISHING_WELL]: QuestProviderStatus.Inactive,
  [QuestProviderKeys.WOODSMAN_AURUM]: QuestProviderStatus.Inactive
}

const initialState: QuestSliceState = {
  heroQuantityRequired: 1,
  questType: QuestType.AttemptBased,
  heroRewardsMap: {},
  questFailed: false,
  rewardQuestData: null,
  rewardedHeroCount: 0,
  selectedHeroes: [],
  selectedGarden: null,
  skillUp: null,
  xpQuantity: 0,
  showQuestGardenSelector: false,
  showQuestManagementModal: false,
  showQuestProviderModal: false,
  activeQuests: [],
  questData: questMap[QuestKeys.FISHING_0],
  questProviderStatusMap,
  questProviderData: questProviderMap[QuestProviderKeys.FISHER_TOM],
  questRewardAddress: ZERO_ADDRESS,
  questManagementTabIndex: 0,
  showQuestRewardModal: false,
  showActiveQuestModal: false
}

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    addSelectedHeroes(state, action: { payload: { hero: Hero[]; maxHeroes: number } }) {
      if (state.selectedHeroes.length < action.payload.maxHeroes) {
        state.selectedHeroes.push(...action.payload.hero)
      } else {
        console.error('Error: Too many heroes')
      }
    },
    setHeroQuantityRequired(state, action: { payload: number }) {
      state.heroQuantityRequired = action.payload
    },
    removeSelectedHero(state, action: { payload: Hero }) {
      const newSelectedHeroes = state.selectedHeroes.filter(h => h.id !== action.payload.id)
      state.selectedHeroes = newSelectedHeroes
    },
    clearSelectedHeroes(state) {
      state.selectedHeroes = []
    },
    addSelectedGarden(state, action: { payload: StakingInfo }) {
      state.selectedGarden = action.payload
    },
    clearSelectedGarden(state) {
      state.selectedGarden = null
    },
    setHeroRewardsMap(state, action: { payload: {} }) {
      const rewardedHeroCount = Object.entries(action.payload).length
      state.rewardedHeroCount = rewardedHeroCount
      state.heroRewardsMap = action.payload
    },
    setHeroRewardsMapDefault(state) {
      state.heroRewardsMap = initialState.heroRewardsMap
    },
    setQuestFailed(state, action) {
      state.questFailed = action.payload
    },
    setQuestFailedDefault(state) {
      state.questFailed = initialState.questFailed
    },
    setRewardQuestData(state, action) {
      state.rewardQuestData = action.payload
    },
    setRewardQuestDataDefault(state) {
      state.rewardQuestData = initialState.rewardQuestData
    },
    setShowQuestGardenSelector(state, action: { payload: boolean }) {
      state.showQuestGardenSelector = action.payload
    },
    setShowQuestManagementModal(state, action: { payload: boolean }) {
      state.showQuestManagementModal = action.payload
    },
    addActiveQuest(state, action: { payload: ActiveQuest }) {
      const questIndex = state.activeQuests.findIndex((obj: any) => obj.id === action.payload.id)
      if (questIndex === -1) state.activeQuests.push(action.payload)
    },
    setActiveQuests(state, action: { payload: ActiveQuest[] }) {
      const newActiveQuests = uniqBy([...state.activeQuests, ...action.payload], 'id')
      state.activeQuests = newActiveQuests
    },
    removeActiveQuest(state, action: { payload: number }) {
      const newActiveQuests = state.activeQuests.filter(q => q.id !== action.payload)
      state.activeQuests = newActiveQuests
    },
    setQuestData(state, action: { payload: Quest }) {
      state.questData = action.payload
    },
    setQuestProviderData(state, action: { payload: QuestProvider }) {
      state.questProviderData = action.payload
    },
    setQuestProviderStatusMap(
      state,
      action: { payload: { provider: QuestProviderKeys; status: QuestProviderStatus } }
    ) {
      const { provider, status } = action.payload
      state.questProviderStatusMap[provider] = status
    },
    resetQuestProviderStatusMap(state) {
      state.questProviderStatusMap = questProviderStatusMap
    },
    setQuestRewardAddress(state, action: { payload: string }) {
      state.questRewardAddress = action.payload
    },
    setShowQuestRewardModal(state, action: { payload: boolean }) {
      state.showQuestRewardModal = action.payload
    },
    setShowQuestProviderModal(state, action: { payload: boolean }) {
      state.showQuestProviderModal = action.payload
    },
    setQuestManagementTabIndex(state, action: { payload: number }) {
      state.questManagementTabIndex = action.payload
    },
    setShowActiveQuestModal(state, action: { payload: boolean }) {
      state.showActiveQuestModal = action.payload
    },
    setQuestDefaults() {
      return initialState
    }
  }
})

export const {
  addSelectedHeroes,
  addSelectedGarden,
  clearSelectedGarden,
  setHeroQuantityRequired,
  removeSelectedHero,
  clearSelectedHeroes,
  setQuestFailed,
  setQuestFailedDefault,
  setHeroRewardsMap,
  setHeroRewardsMapDefault,
  setRewardQuestData,
  setRewardQuestDataDefault,
  setShowQuestGardenSelector,
  setShowQuestManagementModal,
  setShowQuestProviderModal,
  addActiveQuest,
  setActiveQuests,
  removeActiveQuest,
  setQuestData,
  setQuestProviderData,
  setQuestProviderStatusMap,
  resetQuestProviderStatusMap,
  setQuestRewardAddress,
  setShowQuestRewardModal,
  setQuestManagementTabIndex,
  setShowActiveQuestModal,
  setQuestDefaults
} = questsSlice.actions
export default questsSlice.reducer
