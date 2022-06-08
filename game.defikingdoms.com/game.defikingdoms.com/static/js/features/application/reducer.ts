import { createAsyncThunk, createReducer, nanoid } from '@reduxjs/toolkit'
import fetchJsonp from 'fetch-jsonp'
import { isDFKChainHook } from 'utils'
import errorHandler from 'utils/errorHandler'
import { addPopup, PopupContent, removePopup, updateBlockNumber, ApplicationModal, setOpenModal } from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  allowedIp: boolean | null
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  openModal: null,
  allowedIp: null
}
export const allowedIp = createAsyncThunk('application/allowedIp', async () => {
  const soSorryNotAllowed = [
    'Belarus',
    'Cuba',
    'Iran',
    'Libya',
    'North Korea',
    'Somalia',
    'Sudan',
    'Syria',
    'Zimbabwe',
    'Burundi',
    'Congo',
    'Iraq',
    'Lebanon',
    'Nicaragua',
    'Venezuela',
    'Yemen'
  ]
  try {
    const cached = JSON.parse(localStorage.getItem('defiKingdoms_allowed') || '{}')
    const aDayAgo = Date.now() - 24 * 60 * 60 * 1000
    if (cached.valid && aDayAgo < new Date(cached.date).getTime()) {
      return true
    }
    const ipResponse = await fetchJsonp('https://geolocation-db.com/jsonp', {
      jsonpCallbackFunction: 'callback'
    })
    const data = await ipResponse.json()
    if (
      soSorryNotAllowed.includes(data.country_name) ||
      (data.country_name === 'Ukraine' && data.state === 'Autonomous Republic of Crimea')
    ) {
      return false
    } else {
      localStorage.setItem('defiKingdoms_allowed', JSON.stringify({ valid: true, date: Date.now() }))
      return true
    }
  } catch (error) {
    errorHandler(error)
    return true
  }
})

export default createReducer(initialState, builder =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number' || isDFKChainHook(chainId)) {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter(popup => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs
        }
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach(p => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
    .addCase(allowedIp.fulfilled, (state, action) => {
      state.allowedIp = action.payload
    })
)
