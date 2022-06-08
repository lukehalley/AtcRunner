import { createSlice } from '@reduxjs/toolkit'
import { Hero } from 'utils/dfkTypes'

interface BridgeSliceState {
  heroQuantityRequired: number
  selectedHeroes: Hero[]
  showHeroBridgeModal: boolean
}

const initialState: BridgeSliceState = {
  heroQuantityRequired: 1,
  selectedHeroes: [],
  showHeroBridgeModal: false
}

const bridgeSlice = createSlice({
  name: 'bridge',
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
    setShowHeroBridgeModal(state, action: { payload: boolean }) {
      state.showHeroBridgeModal = action.payload
    },
    setBridgeDefaults() {
      return initialState
    }
  }
})

export const {
  addSelectedHeroes,
  clearSelectedHeroes,
  removeSelectedHero,
  setHeroQuantityRequired,
  setShowHeroBridgeModal,
  setBridgeDefaults
} = bridgeSlice.actions
export default bridgeSlice.reducer
