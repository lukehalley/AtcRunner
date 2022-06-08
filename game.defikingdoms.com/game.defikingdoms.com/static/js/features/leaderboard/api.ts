import { dispatch } from 'features'
import { getAccount, getChainId } from 'features/web3/utils'
import { REQUEST } from './constants'
import { setLeaderboardLoading } from './state'
import { GetLeaderboardPayload, GetLeaderboardSelectionPayload, LeaderboardData } from './types'

export async function getLeaderboardData(payload: GetLeaderboardPayload): Promise<any> {
  const account = getAccount()
  const chainId = getChainId()
  dispatch(setLeaderboardLoading(true))
  const timestampString = payload.timestamp.toString()
  const requestUri = `${REQUEST.leaderboard[chainId]}?timestamp=${timestampString}&timespan=${
    payload.timespan
  }&itemAddress=${payload.itemAddress.toLowerCase()}&wallet=${account}`

  const response = await fetch(requestUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })

  const data: LeaderboardData[] = await response.json()
  return data
}

export async function getLeaderboardSelectionData(payload: GetLeaderboardSelectionPayload): Promise<any> {
  const chainId = getChainId()
  dispatch(setLeaderboardLoading(true))
  const timestampString = payload.timestamp.toString()
  const requestUri = `${REQUEST.leaderboardSelection[chainId]}?timestamp=${timestampString}&timespan=${payload.timespan}`
  const response = await fetch(requestUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })

  const data: LeaderboardData[] = await response.json()
  return data
}
