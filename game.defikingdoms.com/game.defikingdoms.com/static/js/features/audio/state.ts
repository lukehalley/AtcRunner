import { createSlice } from '@reduxjs/toolkit'

interface AudioSliceState {
  volume: number
  muted: boolean
  fxVolume: number
  fxMuted: boolean
}

const localAudioSettings = JSON.parse(localStorage.getItem('defiKingdoms_audioSettings') || '{}')

const initialState: AudioSliceState = {
  volume: localAudioSettings.volume || 0.2,
  muted: typeof localAudioSettings.muted !== 'undefined' ? localAudioSettings.muted : true,
  fxVolume: localAudioSettings.fxVolume || 0.2,
  fxMuted: typeof localAudioSettings.fxMuted !== 'undefined' ? localAudioSettings.fxMuted : true
}

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setVolume(state, action: { payload: number }) {
      state.volume = action.payload
    },
    setMuted(state, action: { payload: boolean }) {
      state.muted = action.payload
    },
    setFXVolume(state, action: { payload: number }) {
      state.fxVolume = action.payload
    },
    setFXMuted(state, action: { payload: boolean }) {
      state.fxMuted = action.payload
    }
  }
})

export const { setVolume, setMuted, setFXVolume, setFXMuted } = audioSlice.actions
export default audioSlice.reducer
