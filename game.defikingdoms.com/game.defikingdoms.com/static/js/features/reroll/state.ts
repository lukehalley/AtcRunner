import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AppState } from 'features'
import { getHeroes } from 'features/heroes/api'
import { CurrentNetwork, GetUserHeroesPayload, OriginRealm } from 'features/heroes/types'
import { getParams } from 'features/heroes/utils'
import { isHarmonyHook } from 'utils'
import { Hero } from 'utils/dfkTypes'
import { Rewards, RerollChoices } from './types'

interface RerollSliceState {
  activeTabIndex: number
  selectedHero: Hero | null
  activeRerollHeroes: Hero[]
  rerollHeroes: Hero[]
  totalRerollHeroes: number
  rerollType: RerollChoices | null
  isProcessing: boolean
  rewards: Rewards
  showAlertModal: boolean
  showGen0RerollModal: boolean
  showRewardsModal: boolean
}

const initialState: RerollSliceState = {
  activeTabIndex: 0,
  selectedHero: null,
  activeRerollHeroes: [],
  rerollHeroes: [],
  totalRerollHeroes: 0,
  rerollType: null,
  isProcessing: false,
  rewards: {
    items: [],
    stats: []
  },
  showAlertModal: false,
  showGen0RerollModal: false,
  showRewardsModal: false
}

export const fetchRerollHeroes = createAsyncThunk(
  'reroll/fetchRerollHeroes',
  async ({ account, offset, order, chainId }: GetUserHeroesPayload, { getState }) => {
    if (account) {
      const network = isHarmonyHook(chainId) ? CurrentNetwork.HARMONY : CurrentNetwork.DFK_CHAIN
      const state = getState() as AppState
      const params = getParams(state.heroes.heroFilters)
      const userHeroes = await getHeroes(
        {
          params: { ...params, network, owner: account, originrealm: OriginRealm.SERENDALE, generation: [0, 0] },
          offset,
          order
        },
        chainId
      )

      return userHeroes
    }
    return { data: [], length: 0 }
  }
)

const rerollSlice = createSlice({
  name: 'reroll',
  initialState,
  reducers: {
    setActiveTabIndex(state, action: { payload: number }) {
      state.activeTabIndex = action.payload
    },
    setSelectedHero(state, action: { payload: Hero }) {
      state.selectedHero = action.payload
    },
    removeSelectedHero(state) {
      state.selectedHero = null
    },
    setRerollType(state, action: { payload: RerollChoices }) {
      state.rerollType = action.payload
    },
    setActiveRerollHeroes(state, action: { payload: Hero[] }) {
      state.activeRerollHeroes = action.payload
    },
    addActiveRerollHero(state, action: { payload: Hero }) {
      state.activeRerollHeroes.push(action.payload)
    },
    removeActiveRerollHero(state, action: { payload: Hero }) {
      const newHeroes = state.activeRerollHeroes.filter(h => h.id !== action.payload.id)
      state.activeRerollHeroes = newHeroes
    },
    setIsProcessing(state, action: { payload: boolean }) {
      state.isProcessing = action.payload
    },
    setShowAlertModal(state, action: { payload: boolean }) {
      state.showAlertModal = action.payload
    },
    setShowGen0RerollModal(state, action: { payload: boolean }) {
      state.showGen0RerollModal = action.payload
    },
    setRewards(state, action: { payload: Rewards }) {
      state.rewards = action.payload
    },
    setShowRewardsModal(state, action: { payload: boolean }) {
      state.showRewardsModal = action.payload
    },
    setRerollDefaults() {
      return initialState
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchRerollHeroes.fulfilled, (state, action) => {
      const { data, length } = action.payload
      state.rerollHeroes = data
      state.totalRerollHeroes = length
    })
  }
})

export const {
  setActiveTabIndex,
  setSelectedHero,
  removeSelectedHero,
  setRerollType,
  setActiveRerollHeroes,
  addActiveRerollHero,
  removeActiveRerollHero,
  setIsProcessing,
  setShowAlertModal,
  setShowGen0RerollModal,
  setRewards,
  setShowRewardsModal,
  setRerollDefaults
} = rerollSlice.actions
export default rerollSlice.reducer
