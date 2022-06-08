import { createSlice } from '@reduxjs/toolkit'
import { CutsceneMap } from './types'

interface CutscenesSliceState {
  showModal: boolean
  hasCutscene: boolean
  cutscenesMap: CutsceneMap
}

const initialState: CutscenesSliceState = {
  showModal: false,
  hasCutscene: false,
  cutscenesMap: {}
}

const cutscenesSlice = createSlice({
  name: 'cutscenes',
  initialState,
  reducers: {
    setShowModal(state, action: { payload: boolean }) {
      state.showModal = action.payload
    },
    setCutscenesMap(state, action: { payload: { cutscenesMap: CutsceneMap; pathname: string } }) {
      const { cutscenesMap, pathname } = action.payload
      const cutscenePaths = Object.keys(cutscenesMap)
      state.hasCutscene = cutscenePaths.includes(pathname)
      state.cutscenesMap = cutscenesMap
    }
  }
})

export const { setShowModal, setCutscenesMap } = cutscenesSlice.actions
export default cutscenesSlice.reducer
