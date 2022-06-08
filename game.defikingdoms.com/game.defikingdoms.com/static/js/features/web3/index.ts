import { Web3Provider } from '@ethersproject/providers'
import { createSlice } from '@reduxjs/toolkit'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId } from 'constants/sdk-extra'

interface Web3SliceState {
  account: string | null
  chainId: ChainId | null
  connector: AbstractConnector | null
  library: Web3Provider | null
}

const initialState: Web3SliceState = {
  account: null,
  chainId: null,
  connector: null,
  library: null
}

const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    setAccount(state, action: { payload: string }) {
      state.account = action.payload
    },
    setChainId(state, action: { payload: ChainId }) {
      state.chainId = action.payload
    },
    setConnector(state, action: { payload: AbstractConnector }) {
      state.connector = action.payload
    },
    setLibrary(state, action: { payload: Web3Provider }) {
      state.library = action.payload
    }
  }
})

export const { setAccount, setChainId, setConnector, setLibrary } = web3Slice.actions
export default web3Slice.reducer
