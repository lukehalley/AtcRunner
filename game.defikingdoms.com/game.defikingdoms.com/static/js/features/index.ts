import { pangolinReducers, PANGOLIN_PERSISTED_KEYS } from '@pangolindex/components'
import { Action, configureStore, getDefaultMiddleware, ThunkDispatch } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import airdrops from './airdrops'
import anyswap from './anyswap/state'
import application from './application/reducer'
import audio from './audio/state'
import bridge from './bridge/state'
import burn from './burn/reducer'
import crafting from './crafting/state'
import cutscenes from './cutscenes/state'
import { updateVersion } from './global/actions'
import heroHub from './heroHub/state'
import heroes from './heroes/state'
import items from './items/state'
import journey from './journey/state'
import lands from './lands/state'
import leaderboard from './leaderboard/state'
import leveling from './leveling/state'
import lists from './lists/reducer'
import marketplace from './marketplace/state'
import mint from './mint/reducer'
import multicall from './multicall/reducer'
import notifications from './notifications'
import pets from './pets/state'
import portal from './portal'
import preferences from './preferences/state'
import profile from './profile/state'
import quests from './quests/state'
import reroll from './reroll/state'
import swap from './swap/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import web3 from './web3'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists', ...PANGOLIN_PERSISTED_KEYS]

export const reducers = {
  airdrops,
  anyswap,
  application,
  audio,
  bridge,
  burn,
  crafting,
  cutscenes,
  heroes,
  heroHub,
  items,
  journey,
  lands,
  leaderboard,
  leveling,
  lists,
  marketplace,
  mint,
  multicall,
  notifications,
  pets,
  portal,
  preferences,
  profile,
  quests,
  reroll,
  swap,
  transactions,
  user,
  web3,
  ...pangolinReducers
}

const store = configureStore({
  reducer: reducers,
  middleware: [
    ...getDefaultMiddleware({
      thunk: true,
      serializableCheck: false
    }),
    save({ states: PERSISTED_KEYS })
  ],
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: true })
})

store.dispatch(updateVersion())

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = ThunkDispatch<AppState, {}, Action>

interface StoreUtils {
  dispatch: AppDispatch
  getState: typeof store.getState
}

export const { dispatch, getState }: StoreUtils = store
export default store
