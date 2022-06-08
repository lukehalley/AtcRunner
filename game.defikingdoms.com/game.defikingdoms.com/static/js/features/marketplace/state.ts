import { createSlice } from '@reduxjs/toolkit'

interface MarketplaceSliceState {
  showMarketplaceModal: boolean
}

const initialState: MarketplaceSliceState = {
  showMarketplaceModal: false
}

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setShowMarketplaceModal(state, action: { payload: boolean }) {
      state.showMarketplaceModal = action.payload
    }
  }
})

export const { setShowMarketplaceModal } = marketplaceSlice.actions
export default marketplaceSlice.reducer
