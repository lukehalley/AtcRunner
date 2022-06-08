import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import { AppState } from 'features'
import { GRAVEYARD_ADDRESSES } from 'features/journey/constants'
import { checkAndSetStatBoostHeroes, perilousJourneyStatBoostEnded } from 'features/journey/utils'
import { getAccount, getChainId } from 'features/web3/utils'
import uniqBy from 'lodash/uniqBy'
import { isHarmonyHook } from 'utils'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import {
  getHeroes,
  getHeroesByAssistingAuction,
  getHeroesByAuction,
  getHeroLineage,
  getPurchaseHistory,
  getHeroSalesHistory
} from './api'
import { defaultHeroFilters } from './constants'
import {
  CurrentNetwork,
  GetHeroesPayload,
  GetUserHeroesPayload,
  HeroSaleHistoryPayload,
  OriginRealm,
  PurchaseHistoryPayload,
  SaleOrRent
} from './types'
import { getParams } from './utils'

interface HeroSliceState {
  heroCatalog: Hero[]
  totalHeroCatalog: number
  userHeroes: Hero[]
  deadUserHeroes: Hero[]
  totalDeadUserHeroes: number
  survivedUserHeroes: Hero[]
  totalSurvivedUserHeroes: number
  totalUserHeroes: number
  forSaleHeroes: Hero[]
  totalForSaleHeroes: number
  hirableHeroes: Hero[]
  totalHirableHeroes: number
  loading: boolean
  userHeroesLoading: boolean
  heroSaleHistory: any[]
  heroLineage: any
  heroFilters: any
  resetEventTriggered: boolean
  cooldowns: any
  purchaseHistory: any
}

const initialState: HeroSliceState = {
  heroCatalog: [],
  totalHeroCatalog: 0,
  userHeroes: [],
  deadUserHeroes: [],
  totalDeadUserHeroes: 0,
  survivedUserHeroes: [],
  totalSurvivedUserHeroes: 0,
  totalUserHeroes: 0,
  forSaleHeroes: [],
  totalForSaleHeroes: 0,
  hirableHeroes: [],
  totalHirableHeroes: 0,
  loading: false,
  userHeroesLoading: false,
  heroSaleHistory: [],
  heroLineage: null,
  heroFilters: defaultHeroFilters,
  resetEventTriggered: false,
  cooldowns: {},
  purchaseHistory: {
    rent: [],
    myRent: [],
    sale: [],
    mySale: []
  }
}

export const fetchHeroCatalog = createAsyncThunk(
  'heroes/fetchHeroCatalog',
  async ({ chainId, offset, order }: GetHeroesPayload, { getState }) => {
    const originrealm = isHarmonyHook(chainId) ? OriginRealm.SERENDALE : OriginRealm.CRYSTALVALE
    const state = getState() as AppState
    const params = getParams(state.heroes.heroFilters)
    const heroCatalog = await getHeroes({ params: { ...params, originrealm }, offset, order })
    return heroCatalog
  }
)

export const fetchUserHeroes = createAsyncThunk(
  'heroes/fetchUserHeroes',
  async ({ account, offset, order, chainId }: GetUserHeroesPayload, { getState }) => {
    if (account) {
      const network = isHarmonyHook(chainId) ? CurrentNetwork.HARMONY : CurrentNetwork.DFK_CHAIN
      const state = getState() as AppState
      const params = getParams(state.heroes.heroFilters)
      const userHeroes = await getHeroes(
        {
          params: { ...params, network, owner: account },
          offset,
          order
        },
        chainId
      )

      if (!perilousJourneyStatBoostEnded()) {
        checkAndSetStatBoostHeroes(userHeroes.data)
      }

      return userHeroes
    }
    return { data: [], length: 0 }
  }
)

export const fetchForSaleHeroes = createAsyncThunk(
  'heroes/fetchForSaleHeroes',
  async ({ account, offset, order, chainId }: GetHeroesPayload, { getState }) => {
    const network = isHarmonyHook(chainId) ? CurrentNetwork.HARMONY : CurrentNetwork.DFK_CHAIN
    const state = getState() as AppState
    const params = getParams(state.heroes.heroFilters)
    const forSaleHeroes = await getHeroesByAuction({
      params: { ...params, network, saleprice: params.price },
      offset,
      order
    })
    const privateSaleHeroes = await getHeroesByAuction({
      params: { ...params, network, saleprice: params.price, privateauctionprofile: account ? account : undefined },
      order
    })
    const uniqueData = uniqBy([...privateSaleHeroes.data, ...forSaleHeroes.data], 'id')
    return { data: uniqueData, length: forSaleHeroes.length }
  }
)

export const fetchHirableHeroes = createAsyncThunk(
  'heroes/fetchHirableHeroes',
  async ({ chainId, offset, order }: GetHeroesPayload, { getState }) => {
    const network = isHarmonyHook(chainId) ? CurrentNetwork.HARMONY : CurrentNetwork.DFK_CHAIN
    const state = getState() as AppState
    const params = getParams(state.heroes.heroFilters)
    const hirableHeroes = await getHeroesByAssistingAuction({
      params: { ...params, network, assistingprice: params.price },
      offset,
      order
    })
    return hirableHeroes
  }
)

export const fetchHeroSaleHistory = createAsyncThunk(
  'heroes/fetchHeroSaleHistory',
  async ({ tokenId }: HeroSaleHistoryPayload) => {
    const saleHistory = await getHeroSalesHistory({ params: { tokenId } })
    const completedSales = saleHistory.filter((s: any) => s.winner.id != undefined)

    return completedSales
  }
)

export const fetchHeroLineage = createAsyncThunk('heroes/fetchHeroLineage', async (id: string) => {
  const lineage = await getHeroLineage(id)
  return lineage
})

export const fetchPurchaseHistory = createAsyncThunk(
  'heroes/fetchPurchaseHistory',
  async ({ saleOrRent, skip = 0, onlyOwner = false }: PurchaseHistoryPayload) => {
    const account = getAccount()
    const payload = {
      offset: skip,
      params: {
        seller: onlyOwner ? account : undefined
      }
    }
    const purchaseHistory = await getPurchaseHistory(saleOrRent, payload)
    console.log(purchaseHistory)
    return {
      type: saleOrRent,
      onlyOwner,
      data: purchaseHistory
    }
  }
)

export const fetchDeadUserHeroes = createAsyncThunk(
  'heroes/fetchDeadUserHeroes',
  async ({ offset, order }: GetHeroesPayload, { getState }) => {
    const state = getState() as AppState
    const params = getParams(state.heroes.heroFilters)
    const account = getAccount()
    const chainId = getChainId()
    const deadHeroes = await getHeroes({
      params: { ...params, owner: GRAVEYARD_ADDRESSES[chainId].toLowerCase(), previousowner: account },
      offset,
      order
    })
    return deadHeroes
  }
)

export const fetchSurvivedUserHeroes = createAsyncThunk(
  'heroes/fetchSurvivedUserHeroes',
  async ({ offset, order }: GetHeroesPayload, { getState }) => {
    const state = getState() as AppState
    const params = getParams(state.heroes.heroFilters)
    const account = getAccount()
    const survivedHeroes = await getHeroes({
      params: { ...params, pjowner: account, pjstatus: 'SURVIVED', limit: 1000 },
      offset,
      order
    })
    return survivedHeroes
  }
)

const heroesSlice = createSlice({
  name: 'heroes',
  initialState,
  reducers: {
    updateHero(state, action: { payload: Hero }) {
      const updatedHero = action.payload
      const newHeroes = state.userHeroes.concat([])
      const updatedIndex = newHeroes.findIndex(obj => obj.id === updatedHero.id)
      newHeroes[updatedIndex] = updatedHero
      state.userHeroes = newHeroes
    },
    addUserHero(state, action: { payload: Hero }) {
      const heroId = action.payload.id
      const heroIndex = state.userHeroes.findIndex(obj => obj.id === heroId)

      if (heroIndex === -1) {
        state.userHeroes.push(action.payload)
      }
    },
    removeUserHero(state, action: { payload: string | number | BigNumber }) {
      const heroId = action.payload
      const updatedHeroes = state.userHeroes.filter(hero => hero.id !== heroId)
      state.userHeroes = updatedHeroes
    },
    removeForSaleHero(state, action: { payload: string | number | BigNumber }) {
      const heroId = action.payload
      const updatedHeroes = state.forSaleHeroes.filter(hero => hero.id !== heroId)
      state.forSaleHeroes = updatedHeroes
    },
    setHeroSaleHistory(state, action) {
      state.heroSaleHistory = action.payload
    },
    setHeroLineage(state, action) {
      state.heroLineage = action.payload
    },
    setHeroFilters(state, action) {
      if (action.payload.filterType === 'stats') {
        state.heroFilters = {
          ...state.heroFilters,
          stats: {
            ...state.heroFilters.stats,
            stats: {
              ...state.heroFilters.stats.stats,
              [action.payload.filterSubType]: [
                ...action.payload.filterObject // an array in this case
              ]
            }
          }
        }
      } else if (action.payload.filterType === 'skills') {
        state.heroFilters = {
          ...state.heroFilters,
          stats: {
            ...state.heroFilters.stats,
            skills: {
              ...state.heroFilters.stats.skills,
              [action.payload.filterSubType]: [
                ...action.payload.filterObject // an array in this case
              ]
            }
          }
        }
      } else {
        state.heroFilters = {
          ...state.heroFilters,
          [action.payload.filterType]: {
            ...state.heroFilters[action.payload.filterType],
            // sometimes this is any array (sliders specifically)
            [action.payload.filterSubType]: Array.isArray(action.payload.filterObject)
              ? [...action.payload.filterObject]
              : // sometimes this is a single string
              typeof action.payload.filterObject === 'string'
              ? action.payload.filterObject
              : // but usually it's an object
                {
                  ...state.heroFilters[action.payload.filterType][action.payload.filterSubType],
                  ...action.payload.filterObject
                }
          }
        }
      }
    },
    resetHeroFilters(state) {
      state.heroFilters = defaultHeroFilters
    },
    setResetEventTriggered(state) {
      state.resetEventTriggered = !state.resetEventTriggered
    },
    setCooldown(state, action) {
      const { transactionHash } = action.payload
      const addResponseTimestamp: { responseTime?: number } = {}
      if (!transactionHash) {
        return
      }
      // this is what we are basing the timer off of. When the transaction has come back
      if (transactionHash && !state.cooldowns[transactionHash]) {
        addResponseTimestamp.responseTime = Math.floor(Date.now() / 1000)
      }
      state.cooldowns = {
        ...state.cooldowns,
        [transactionHash]: {
          ...(state.cooldowns[transactionHash] || {}),
          ...action.payload,
          ...addResponseTimestamp
        }
      }
    },
    removeCooldown(state, action) {
      const { transactionHash } = action.payload
      const newCooldowns = { ...state.cooldowns }
      delete newCooldowns[transactionHash]
      state.cooldowns = newCooldowns
    },
    setPurchaseHistory(state, action) {
      if (action.payload.type === SaleOrRent.sale && !action.payload.onlyOwner) {
        state.purchaseHistory.sale = uniqBy(action.payload.data, 'id')
      } else if (action.payload.type === SaleOrRent.sale && action.payload.onlyOwner) {
        state.purchaseHistory.mySale = uniqBy(action.payload.data, 'id')
      } else if (action.payload.type === SaleOrRent.rent && !action.payload.onlyOwner) {
        state.purchaseHistory.rent = uniqBy(action.payload.data, 'id')
      } else if (action.payload.type === SaleOrRent.rent && action.payload.onlyOwner) {
        state.purchaseHistory.myRent = uniqBy(action.payload.data, 'id')
      }
    },
    setHeroDefaults() {
      return initialState
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchHeroCatalog.pending, state => {
        state.loading = true
      })
      .addCase(fetchHeroCatalog.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.loading = false
        state.heroCatalog = data
        state.totalHeroCatalog = length
      })
      .addCase(fetchHeroCatalog.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })

      .addCase(fetchUserHeroes.pending, state => {
        state.userHeroesLoading = true
      })
      .addCase(fetchUserHeroes.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.loading = false
        state.userHeroesLoading = false
        state.userHeroes = data
        state.totalUserHeroes = length
      })
      .addCase(fetchUserHeroes.rejected, (state, action) => {
        state.userHeroesLoading = false
        errorHandler(action.error.message)
      })

      .addCase(fetchDeadUserHeroes.pending, state => {
        state.loading = true
      })
      .addCase(fetchDeadUserHeroes.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.loading = false
        state.deadUserHeroes = data
        state.totalDeadUserHeroes = length
      })
      .addCase(fetchDeadUserHeroes.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })

      .addCase(fetchSurvivedUserHeroes.pending, state => {
        state.loading = true
      })
      .addCase(fetchSurvivedUserHeroes.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.loading = false
        state.survivedUserHeroes = data
        state.totalSurvivedUserHeroes = length
      })
      .addCase(fetchSurvivedUserHeroes.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })

      .addCase(fetchForSaleHeroes.pending, state => {
        state.loading = true
      })
      .addCase(fetchForSaleHeroes.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.loading = false
        state.forSaleHeroes = data
        state.totalForSaleHeroes = length
      })
      .addCase(fetchForSaleHeroes.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })

      .addCase(fetchHirableHeroes.pending, state => {
        state.loading = true
      })
      .addCase(fetchHirableHeroes.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.loading = false
        state.hirableHeroes = data
        state.totalHirableHeroes = length
      })
      .addCase(fetchHirableHeroes.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })

      .addCase(fetchHeroSaleHistory.fulfilled, (state, action) => {
        state.heroSaleHistory = action.payload
      })
      .addCase(fetchHeroSaleHistory.rejected, (state, action) => {
        errorHandler(action.error.message)
      })

      .addCase(fetchHeroLineage.fulfilled, (state, action) => {
        state.heroLineage = action.payload
      })
      .addCase(fetchHeroLineage.rejected, (state, action) => {
        errorHandler(action.error.message)
      })

      .addCase(fetchPurchaseHistory.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.type === SaleOrRent.sale && !action.payload.onlyOwner) {
          state.purchaseHistory.sale = [...state.purchaseHistory.sale, ...action.payload.data]
        } else if (action.payload.type === SaleOrRent.sale && action.payload.onlyOwner) {
          state.purchaseHistory.mySale = [...state.purchaseHistory.mySale, ...action.payload.data]
        } else if (action.payload.type === SaleOrRent.rent && !action.payload.onlyOwner) {
          state.purchaseHistory.rent = [...state.purchaseHistory.rent, ...action.payload.data]
        } else if (action.payload.type === SaleOrRent.rent && action.payload.onlyOwner) {
          state.purchaseHistory.myRent = [...state.purchaseHistory.myRent, ...action.payload.data]
        }
      })
      .addCase(fetchPurchaseHistory.pending, state => {
        state.loading = true
      })
      .addCase(fetchPurchaseHistory.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })
  }
})

const { actions, reducer } = heroesSlice
export const {
  addUserHero,
  removeUserHero,
  removeForSaleHero,
  updateHero,
  setHeroSaleHistory,
  setHeroLineage,
  setHeroFilters,
  resetHeroFilters,
  setResetEventTriggered,
  setCooldown,
  removeCooldown,
  setPurchaseHistory,
  setHeroDefaults
} = actions
export default reducer
