import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import errorHandler from 'utils/errorHandler'
import { getLeaderboardData, getLeaderboardSelectionData } from './api'
import {
  GetLeaderboardPayload,
  GetLeaderboardSelectionPayload,
  HeroLeaderboardQuantity,
  LeaderboardSelectionData,
  PlayerStanding,
  WalletLeaderboardQuantity
} from './types'

interface LeaderboardSliceState {
  leaderboardWalletData: {
    normalized: WalletLeaderboardQuantity[]
    nonnormalized: WalletLeaderboardQuantity[]
  }
  leaderboardHeroData: {
    normalized: HeroLeaderboardQuantity[]
    nonnormalized: HeroLeaderboardQuantity[]
  }
  playerStanding: {
    normalized: number
    nonnormalized: number
  }
  leaderboardLoading: boolean
  featuredDailyLeaderboard: LeaderboardSelectionData | null
  featuredWeeklyLeaderboard: LeaderboardSelectionData | null
  featuredMonthlyLeaderboard: LeaderboardSelectionData | null
  leaderboardSelectionLoading: boolean
}

const initialState: LeaderboardSliceState = {
  leaderboardWalletData: {
    normalized: [],
    nonnormalized: []
  },
  leaderboardHeroData: {
    normalized: [],
    nonnormalized: []
  },
  playerStanding: {
    normalized: 0,
    nonnormalized: 0
  },
  featuredDailyLeaderboard: null,
  featuredWeeklyLeaderboard: null,
  featuredMonthlyLeaderboard: null,
  leaderboardLoading: false,
  leaderboardSelectionLoading: false
}

export const fetchLeaderboardData = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async ({ itemAddress, timespan, timestamp }: GetLeaderboardPayload) => {
    const leaderboardData = await getLeaderboardData({ itemAddress, timespan, timestamp })
    return leaderboardData
  }
)

export const fetchLeaderboardSelectionData = createAsyncThunk(
  'leaderboard/fetchLeaderboardSelection',
  async ({ timespan, timestamp }: GetLeaderboardSelectionPayload) => {
    const leaderboardData = await getLeaderboardSelectionData({ timespan, timestamp })
    return leaderboardData
  }
)

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setLeaderboardLoading(state, action: { payload: boolean }) {
      state.leaderboardLoading = action.payload
    },
    setLeaderboardSelectionLoading(state, action: { payload: boolean }) {
      state.leaderboardSelectionLoading = action.payload
    }
  },
  extraReducers(builder) {
    builder
      .addCase(
        fetchLeaderboardData.fulfilled,
        (
          state,
          action: {
            payload: {
              leadingPlayers: WalletLeaderboardQuantity[]
              leadingPlayersNormalized: WalletLeaderboardQuantity[]
              leadingHeroes: HeroLeaderboardQuantity[]
              leadingHeroesNormalized: HeroLeaderboardQuantity[]
              playerStanding: PlayerStanding
            }
          }
        ) => {
          state.leaderboardHeroData = {
            normalized: action.payload.leadingHeroesNormalized || [],
            nonnormalized: action.payload.leadingHeroes || []
          }
          state.leaderboardWalletData = {
            normalized: action.payload.leadingPlayersNormalized || [],
            nonnormalized: action.payload.leadingPlayers || []
          }
          state.playerStanding = {
            normalized: action.payload.playerStanding.normalized,
            nonnormalized: Number(action.payload.playerStanding.sum)
          }
          state.leaderboardLoading = false
        }
      )
      .addCase(fetchLeaderboardData.pending, state => {
        state.leaderboardLoading = false
      })
      .addCase(fetchLeaderboardData.rejected, (state, action) => {
        state.leaderboardLoading = false
        state.leaderboardHeroData = {
          normalized: [],
          nonnormalized: []
        }
        state.leaderboardWalletData = {
          normalized: [],
          nonnormalized: []
        }
        errorHandler(action.error.message)
      })

      .addCase(fetchLeaderboardSelectionData.fulfilled, (state, action: { payload: LeaderboardSelectionData }) => {
        const data = action.payload

        if (data.timespan === 'D') {
          state.featuredDailyLeaderboard = data
        } else if (data.timespan === 'W') {
          state.featuredWeeklyLeaderboard = data
        } else if (data.timespan === 'M') {
          state.featuredMonthlyLeaderboard = data
        }

        state.leaderboardSelectionLoading = false
      })
      .addCase(fetchLeaderboardSelectionData.pending, state => {
        state.leaderboardSelectionLoading = false
      })
      .addCase(fetchLeaderboardSelectionData.rejected, (state, action) => {
        state.leaderboardSelectionLoading = false
        errorHandler(action.error.message)
      })
  }
})

export const { setLeaderboardLoading, setLeaderboardSelectionLoading } = leaderboardSlice.actions
export default leaderboardSlice.reducer
