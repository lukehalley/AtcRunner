import { isMobile } from 'react-device-detect'
import { createSlice } from '@reduxjs/toolkit'

interface PreferencesSliceState {
  profileDetailsOpen: boolean
  customCursor: boolean
}

const userSettings = JSON.parse(localStorage.getItem('defiKingdoms_userSettings') || '{}')

const initialState: PreferencesSliceState = {
  profileDetailsOpen:
    typeof userSettings.profileDetailsOpen !== 'undefined' ? userSettings.profileDetailsOpen : isMobile ? false : true,
  customCursor: typeof userSettings.customCursor !== 'undefined' ? userSettings.customCursor : true
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setProfileDetailsOpen(state, action) {
      const profileDetailsOpen = action.payload
      localStorage.setItem('defiKingdoms_userSettings', JSON.stringify({ ...state, profileDetailsOpen }))
      state.profileDetailsOpen = profileDetailsOpen
    },
    setCustomCursor(state, action: { payload: boolean }) {
      const customCursor = action.payload
      localStorage.setItem('defiKingdoms_userSettings', JSON.stringify({ ...state, customCursor }))
      state.customCursor = customCursor
    }
  }
})

const { actions, reducer } = preferencesSlice
export const { setProfileDetailsOpen, setCustomCursor } = actions
export default reducer
