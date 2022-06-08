import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import errorHandler from 'utils/errorHandler'
import { fetchNetworkTokens, pollTxURL } from './api'
import { handleAnySwapOut } from './contracts'
import { HandleSwapPayload, NetworkTokenMap } from './types'

interface AnyswapSliceState {
  completedTxURL: string
  loading: boolean
  polling: boolean
  networkMap: NetworkTokenMap | null
}

const initialState: AnyswapSliceState = {
  completedTxURL: '',
  loading: false,
  polling: false,
  networkMap: null
}

export const getTokenLists = createAsyncThunk('anyswap/getTokenLists', async () => {
  const networkMap: NetworkTokenMap = await fetchNetworkTokens()
  return networkMap
})

export const handleSwap = createAsyncThunk('anyswap/handleSwap', async (payload: HandleSwapPayload) => {
  const receipt = await handleAnySwapOut(payload)
  const completedTxURL = await pollTxURL(receipt.transactionHash)
  return completedTxURL
})

const anyswapSlice = createSlice({
  name: 'anyswap',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getTokenLists.pending, state => {
        state.loading = true
      })
      .addCase(getTokenLists.fulfilled, (state, action: { payload: NetworkTokenMap }) => {
        state.loading = false
        state.networkMap = action.payload
      })
      .addCase(getTokenLists.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })

      .addCase(handleSwap.pending, state => {
        state.polling = true
      })
      .addCase(handleSwap.fulfilled, (state, action: { payload: string }) => {
        state.polling = false
        state.completedTxURL = action.payload
      })
      .addCase(handleSwap.rejected, (state, action) => {
        state.polling = false
        errorHandler(action.error.message)
      })
  }
})

const { actions, reducer } = anyswapSlice
export const {} = actions
export default reducer
