import { createSlice } from '@reduxjs/toolkit'
import { Hero } from 'utils/dfkTypes'
import { ActiveJourney, BoostedHeroData, PerilousJourneyHeroWithRewards } from './types'

interface JourneySliceState {
  activeJourneyModalType: string
  heroQuantityRequired: number
  selectedHeroes: Hero[]
  showJourneySplashScreen: boolean
  showViewSentHeroesModal: boolean
  showCheckSurvivorsModal: boolean
  showSurvivorStatBoostModal: boolean
  showRewardsModal: boolean
  showBoostRewardsModal: boolean
  showViewPerishedHeroesModal: boolean
  showCrewRecordsModal: boolean
  activeJournies: ActiveJourney[]
  survivedHeroesWithRewards: PerilousJourneyHeroWithRewards[]
  perishedHeroesWithRewards: PerilousJourneyHeroWithRewards[]
  statBoostHeroes: Hero[]
  selectedStatBoostHero: Hero | null
  boostedHeroData: BoostedHeroData | null
  loadingUserSubmissions: boolean
}

const initialState: JourneySliceState = {
  activeJourneyModalType: 'journeyStandard',
  heroQuantityRequired: 1,
  selectedHeroes: [],
  showJourneySplashScreen: false,
  showViewSentHeroesModal: false,
  showCheckSurvivorsModal: false,
  showSurvivorStatBoostModal: false,
  showRewardsModal: false,
  showBoostRewardsModal: false,
  activeJournies: [],
  survivedHeroesWithRewards: [],
  perishedHeroesWithRewards: [],
  showViewPerishedHeroesModal: false,
  showCrewRecordsModal: false,
  statBoostHeroes: [],
  selectedStatBoostHero: null,
  boostedHeroData: null,
  loadingUserSubmissions: false
}

const journeySlice = createSlice({
  name: 'journies',
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
    setShowJourneySplashScreen(state, action: { payload: boolean }) {
      state.showJourneySplashScreen = action.payload
    },
    setShowViewSentHeroesModal(state, action: { payload: boolean }) {
      state.showViewSentHeroesModal = action.payload
    },
    setShowCheckSurvivorsModal(state, action: { payload: boolean }) {
      state.showCheckSurvivorsModal = action.payload
    },
    setShowRewardsModal(state, action: { payload: boolean }) {
      state.showRewardsModal = action.payload
    },
    setShowSurvivorStatBoostModal(state, action: { payload: boolean }) {
      state.showSurvivorStatBoostModal = action.payload
    },
    setShowViewPerishedHeroesModal(state, action: { payload: boolean }) {
      state.showViewPerishedHeroesModal = action.payload
    },
    setShowCrewRecordsModal(state, action: { payload: boolean }) {
      state.showCrewRecordsModal = action.payload
    },
    setShowBoostRewardsModal(state, action: { payload: boolean }) {
      state.showBoostRewardsModal = action.payload
    },
    setActiveJourneyModalType(state, action: { payload: string }) {
      state.activeJourneyModalType = action.payload
    },
    setActiveJournies(state, action: { payload: ActiveJourney[] }) {
      state.activeJournies = action.payload
    },
    setSurvivedHeroesWithRewards(state, action: { payload: PerilousJourneyHeroWithRewards[] }) {
      state.survivedHeroesWithRewards = action.payload
    },
    setPerishedHeroesWithRewards(state, action: { payload: PerilousJourneyHeroWithRewards[] }) {
      state.perishedHeroesWithRewards = action.payload
    },
    setStatBoostHeroes(state, action: { payload: Hero[] }) {
      state.statBoostHeroes = action.payload
    },
    removeStatBoostHero(state, action) {
      const heroId = action.payload
      const updatedHeroes = state.statBoostHeroes.filter((hero: Hero) => hero.id !== heroId)
      state.statBoostHeroes = updatedHeroes
    },
    setSelectedStatBoostHero(state, action: { payload: Hero | null }) {
      state.selectedStatBoostHero = action.payload
    },
    setBoostedHeroData(state, action: { payload: BoostedHeroData }) {
      state.boostedHeroData = action.payload
    },
    setLoadingUserSubmissions(state, action: { payload: boolean }) {
      state.loadingUserSubmissions = action.payload
    },
    setJourniesDefaults() {
      return initialState
    }
  }
})

export const {
  addSelectedHeroes,
  clearSelectedHeroes,
  removeSelectedHero,
  setHeroQuantityRequired,
  setShowJourneySplashScreen,
  setActiveJourneyModalType,
  setShowViewSentHeroesModal,
  setShowCheckSurvivorsModal,
  setShowRewardsModal,
  setShowSurvivorStatBoostModal,
  setShowViewPerishedHeroesModal,
  setShowBoostRewardsModal,
  setShowCrewRecordsModal,
  setActiveJournies,
  setSurvivedHeroesWithRewards,
  setPerishedHeroesWithRewards,
  setStatBoostHeroes,
  removeStatBoostHero,
  setSelectedStatBoostHero,
  setBoostedHeroData,
  setLoadingUserSubmissions,
  setJourniesDefaults
} = journeySlice.actions
export default journeySlice.reducer
