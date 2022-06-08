import { createSlice } from '@reduxjs/toolkit'
import { ActiveMeditation, LeveledHeroData } from './types'

interface MeditationSliceState {
  activeMeditations: ActiveMeditation[]
  showLevelingRewardsModal: boolean
  leveledHeroData: LeveledHeroData | null
}

const initialState: MeditationSliceState = {
  activeMeditations: [],
  showLevelingRewardsModal: false,
  leveledHeroData: null
}

const meditationSlice = createSlice({
  name: 'meditations',
  initialState,
  reducers: {
    addActiveMeditation(state, action: { payload: ActiveMeditation }) {
      const meditationId = action.payload.id
      const levelingIndex = state.activeMeditations.findIndex((obj: any) => obj.id === meditationId)

      if (levelingIndex === -1) {
        state.activeMeditations.push(action.payload)
      }
    },
    setActiveMeditations(state, action: { payload: ActiveMeditation[] }) {
      state.activeMeditations = action.payload
    },
    removeActiveMeditation(state, action: { payload: string | number }) {
      const newActiveLeveling = state.activeMeditations.filter(l => l.id !== action.payload)
      state.activeMeditations = newActiveLeveling
    },
    setShowLevelingRewardsModal(state, action: { payload: boolean }) {
      state.showLevelingRewardsModal = action.payload
    },
    setLeveledHeroData(state, action: { payload: LeveledHeroData }) {
      state.leveledHeroData = action.payload
    },
    setMeditationDefaults() {
      return initialState
    }
  }
})

export const {
  addActiveMeditation,
  setActiveMeditations,
  removeActiveMeditation,
  setShowLevelingRewardsModal,
  setLeveledHeroData,
  setMeditationDefaults
} = meditationSlice.actions
export default meditationSlice.reducer
