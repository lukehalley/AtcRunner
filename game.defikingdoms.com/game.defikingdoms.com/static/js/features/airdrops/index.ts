import { createSlice } from '@reduxjs/toolkit'
import { Item } from 'features/items/Item'

export type Airdrop = {
  id: number
  quantity: number
  note: string
  time: number
  item?: Item | null
}

interface AirdropSliceState {
  airdrops: Airdrop[]
  showAirdropsModal: boolean
}

const initialState: AirdropSliceState = {
  airdrops: [],
  showAirdropsModal: false
}

const airdropSlice = createSlice({
  name: 'airdrops',
  initialState,
  reducers: {
    setAirdrops(state, action: { payload: Airdrop[] }) {
      state.airdrops = action.payload
    },
    setShowAirdropsModal(state, action: { payload: boolean }) {
      state.showAirdropsModal = action.payload
    },
    removeClaimedAirdrop(state, action: { payload: Airdrop }) {
      const updatedAirdrops = state.airdrops.filter(a => a.id !== action.payload.id)
      state.airdrops = updatedAirdrops
    },
    setAirdropsDefaults() {
      return initialState
    }
  }
})

export const { setAirdrops, setShowAirdropsModal, removeClaimedAirdrop, setAirdropsDefaults } = airdropSlice.actions
export default airdropSlice.reducer
