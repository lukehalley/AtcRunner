import { createSlice } from '@reduxjs/toolkit'
import { Hero } from 'utils/dfkTypes'
import { heroHubMap } from './constants'
import { ActiveModalType, ListType } from './types'

interface HeroHubSliceState {
  showHeroHub: boolean
  activeModalType: ActiveModalType
  listType: ListType
  heroHubTitle: string
  singleSelectHero: Hero | null
  showHeroDetailsModal: boolean
  heroDetailsModalHero: Hero | null
  heroDetailsModalTitle: string
  allFlipped: boolean
  allAnimated: boolean
  rentAmount: number
  sellAmount: number
}

const initialState: HeroHubSliceState = {
  showHeroHub: false,
  activeModalType: ActiveModalType.view,
  listType: ListType.owned,
  heroHubTitle: '',
  singleSelectHero: null,
  showHeroDetailsModal: false,
  heroDetailsModalHero: null,
  heroDetailsModalTitle: '',
  allFlipped: false,
  allAnimated: true,
  rentAmount: 0,
  sellAmount: 0
}

const heroHubSlice = createSlice({
  name: 'heroHub',
  initialState,
  reducers: {
    setShowHeroHub(state, action: { payload: boolean }) {
      state.showHeroHub = action.payload
    },
    setActiveModalType(state, action: { payload: ActiveModalType }) {
      state.activeModalType = action.payload
    },
    setListType(state, action: { payload: ListType }) {
      state.listType = action.payload
    },
    setHeroHubTitle(state, action: { payload: string }) {
      state.heroHubTitle = action.payload
    },
    setSelectedHeroHub(state, action: { payload: { modalKey: ActiveModalType; dynamicTitle?: string } }) {
      const activeModalData = heroHubMap[action.payload.modalKey]
      state.heroHubTitle = action.payload.dynamicTitle || activeModalData.title
      state.activeModalType = activeModalData.activeModalType
      state.listType = activeModalData.listType
      state.showHeroHub = true
    },
    setSingleSelectHero(state, action: { payload: Hero | null }) {
      state.singleSelectHero = action.payload
    },
    setShowHeroDetailsModal(state, action: { payload: boolean }) {
      state.showHeroDetailsModal = action.payload
      state.rentAmount = initialState.rentAmount
      state.sellAmount = initialState.sellAmount
    },
    setHeroDetailsModalHero(state, action: { payload: Hero }) {
      state.heroDetailsModalHero = action.payload
    },
    setHeroDetailsModalTitle(state, action: { payload: string }) {
      state.heroDetailsModalTitle = action.payload
    },
    setAllFlipped(state, action: { payload: boolean }) {
      state.allFlipped = action.payload
    },
    setAllAnimated(state, action: { payload: boolean }) {
      state.allAnimated = action.payload
    },
    setRentAmount(state, action: { payload: number }) {
      state.rentAmount = action.payload
    },
    setSellAmount(state, action: { payload: number }) {
      state.sellAmount = action.payload
    },
    setHeroHubDefaults() {
      return initialState
    }
  }
})

export const {
  setShowHeroHub,
  setActiveModalType,
  setListType,
  setHeroHubTitle,
  setSelectedHeroHub,
  setSingleSelectHero,
  setShowHeroDetailsModal,
  setHeroDetailsModalHero,
  setHeroDetailsModalTitle,
  setAllFlipped,
  setAllAnimated,
  setRentAmount,
  setSellAmount,
  setHeroHubDefaults
} = heroHubSlice.actions
export default heroHubSlice.reducer
