import { createSlice } from '@reduxjs/toolkit'
import { defaultLandFilters, defaultLandSorting } from './constants'
import { Land, LandHubType, LandFilters, LandSorting } from './types'

interface LandSliceState {
  lands: Land[]
  userLands: Land[]
  landsLoading: boolean
  landHubType: LandHubType
  showLandHubModal: boolean
  selectedLandPlotId: number | null
  selectedLandPlot: Land | null
  showLandPlotModal: boolean
  showSellPlotModal: boolean
  landFilters: LandFilters
  landSorting: LandSorting
}

const initialState: LandSliceState = {
  lands: [],
  userLands: [],
  landsLoading: false,
  landHubType: LandHubType.USER,
  showLandHubModal: false,
  selectedLandPlotId: null,
  selectedLandPlot: null,
  showLandPlotModal: false,
  showSellPlotModal: false,
  landFilters: { ...defaultLandFilters },
  landSorting: { ...defaultLandSorting }
}

const landSlice = createSlice({
  name: 'lands',
  initialState,
  reducers: {
    setLandsLoading(state, action: { payload: boolean }) {
      state.landsLoading = action.payload
    },
    setLands(state, action: { payload: Land[] }) {
      state.lands = action.payload
    },
    updateLand(state, action: { payload: Land }) {
      const updatedLand = action.payload
      const newLands = state.lands.concat([])
      const updatedIndex = newLands.findIndex((obj: any) => obj.id === updatedLand.id)
      newLands[updatedIndex] = updatedLand
      state.lands = newLands
    },
    setLandHubType(state, action: { payload: LandHubType }) {
      state.landHubType = action.payload
    },
    setSelectedLandPlotId(state, action: { payload: number }) {
      state.selectedLandPlotId = action.payload
    },
    setShowLandHubModal(state, action: { payload: boolean }) {
      state.showLandHubModal = action.payload
    },
    setShowLandPlotModal(state, action: { payload: boolean }) {
      if (!action.payload) {
        state.selectedLandPlotId = null
        state.selectedLandPlot = null
      }
      state.showLandPlotModal = action.payload
    },
    setShowSellPlotModal(state, action: { payload: boolean }) {
      if (!action.payload) {
        state.selectedLandPlotId = null
        state.selectedLandPlot = null
      }
      state.showSellPlotModal = action.payload
    },
    addUserLand(state, action: { payload: Land }) {
      const landId = action.payload.id
      const landIndex = state.userLands.findIndex((obj: any) => obj.id === landId)

      if (landIndex === -1) {
        state.userLands.push(action.payload)
      }
    },
    removeUserLand(state, action: { payload: number }) {
      const landId = action.payload
      const updatedLands = state.userLands.filter((land: any) => land.id !== landId)
      state.userLands = updatedLands
    },
    setUserLands(state, action: { payload: Land[] }) {
      state.userLands = action.payload
    },
    updateUserLand(state, action: { payload: Land }) {
      const updatedLand = action.payload
      const newLands = state.userLands.concat([])
      const updatedIndex = newLands.findIndex((obj: any) => obj.id === updatedLand.id)
      newLands[updatedIndex] = updatedLand
      state.userLands = newLands
    },
    setLandFilters(state, action: { payload: LandFilters }) {
      state.landFilters = action.payload
    },
    resetLandFilters(state) {
      state.landFilters = { ...defaultLandFilters }
    },
    setLandSorting(state, action: { payload: LandSorting }) {
      state.landSorting = action.payload
    },
    setLandsDefaults() {
      return initialState
    }
  }
})

export const {
  setLandsLoading,
  setLands,
  updateLand,
  setLandHubType,
  setSelectedLandPlotId,
  setShowLandHubModal,
  setShowLandPlotModal,
  setShowSellPlotModal,
  addUserLand,
  removeUserLand,
  setUserLands,
  updateUserLand,
  setLandsDefaults,
  setLandFilters,
  resetLandFilters,
  setLandSorting
} = landSlice.actions
export default landSlice.reducer
