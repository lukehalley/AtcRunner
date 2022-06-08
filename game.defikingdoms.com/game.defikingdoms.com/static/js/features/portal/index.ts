import { createSlice } from '@reduxjs/toolkit'
import { HeroPosition, PortalHero, SecondaryPortalHero, SelectionTypes, Stat } from './types'
import { updateHeroStates } from './utils'

interface PortalSliceState {
  currentlySelecting: SelectionTypes
  selectedHeroes: {
    [index: string]: PortalHero | SecondaryPortalHero | null
    primary: PortalHero | null
    secondary: SecondaryPortalHero | null
  }
  tears: number
  isTearsDeficient: boolean
}

const initialState: PortalSliceState = {
  currentlySelecting: null,
  selectedHeroes: {
    primary: null,
    secondary: null
  },
  tears: 0,
  isTearsDeficient: false
}

const portalSlice = createSlice({
  name: 'portal',
  initialState,
  reducers: {
    setCurrentlySelecting(state, action: { payload: HeroPosition }) {
      state.currentlySelecting = action.payload
    },
    setSelectedHero(
      state,
      action: { payload: { hero: PortalHero | SecondaryPortalHero; position: HeroPosition; wasHired?: boolean } }
    ) {
      const { hero, position, wasHired } = action.payload
      const newHero = updateHeroStates(hero, wasHired)
      setTears(newHero.tearsBonus)
      state.selectedHeroes[position] = newHero
    },
    removeSelectedHero(state, action: { payload: HeroPosition }) {
      state.selectedHeroes[action.payload] = null
    },
    setSelectedHeroSortedStats(state, action: { payload: { heroPosition: HeroPosition; bonusStats: Stat[] } }) {
      const { heroPosition, bonusStats } = action.payload
      if (heroPosition !== null) {
        ;(state.selectedHeroes[heroPosition] as PortalHero).sortedStats = bonusStats
      }
    },
    setTears(state, action: { payload: number }) {
      const tearValue =
        action.payload -
        (state.selectedHeroes.primary?.tearsBonus || 0) -
        (state.selectedHeroes.secondary?.tearsBonus || 0)
      state.tears = tearValue
    },
    setIsTearsDeficient(state, action: { payload: boolean }) {
      state.isTearsDeficient = action.payload
    },
    setSelectedHeroTearsBonus(state, action: { payload: { heroPosition: HeroPosition; tearsBonus: number } }) {
      const { heroPosition, tearsBonus } = action.payload
      if (heroPosition !== null) {
        ;((state.selectedHeroes[heroPosition] as PortalHero).tearsBonus as number) = tearsBonus
      }
    },
    setPortalDefaults() {
      return initialState
    }
  }
})

export const {
  setCurrentlySelecting,
  setSelectedHero,
  removeSelectedHero,
  setSelectedHeroSortedStats,
  setSelectedHeroTearsBonus,
  setTears,
  setIsTearsDeficient,
  setPortalDefaults
} = portalSlice.actions
export default portalSlice.reducer
