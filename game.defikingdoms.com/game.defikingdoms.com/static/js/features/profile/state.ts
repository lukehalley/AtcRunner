import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ChainId } from 'constants/sdk-extra'
import { Hero } from 'utils/dfkTypes'
import { getProfile } from './api'
import { Profile, ProfilePicture } from './types'

interface ProfileSliceState {
  boredApeTokens: ProfilePicture[]
  profile: Profile | null
  profileHeroes: Hero[]
  profileLoading: boolean
}

const initialState: ProfileSliceState = {
  boredApeTokens: [],
  profile: null,
  profileHeroes: [],
  profileLoading: false
}

interface FetchProfilePayload {
  id: string
  chainId: ChainId
}

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async ({ id, chainId }: FetchProfilePayload) => {
  const profile = await getProfile({ id, chainId })
  return profile
})

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setBoredApeTokens(state, action: { payload: ProfilePicture[] }) {
      state.boredApeTokens = action.payload
    },
    setProfile(state, action: { payload: Profile | null }) {
      state.profile = action.payload
    },
    setProfileHeroes(state, action: { payload: Hero[] }) {
      state.profileHeroes = action.payload
    },
    setProfileLoading(state, action: { payload: boolean }) {
      state.profileLoading = action.payload
    },
    updateProfilePic(state, action: { payload: { nftId: number; collectionId: number; picUri: string } }) {
      if (state.profile) {
        const updatedProfile = { ...state.profile, ...action.payload }
        state.profile = updatedProfile
      }
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchProfile.fulfilled, (state, action: { payload: Profile | null }) => {
      state.profile = action.payload
    })
  }
})

export const { setBoredApeTokens, setProfile, setProfileHeroes, setProfileLoading, updateProfilePic } =
  profileSlice.actions
export default profileSlice.reducer
