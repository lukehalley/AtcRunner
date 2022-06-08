import { ChainId } from 'constants/sdk-extra'
import { poll } from 'utils/poll'
import { PollData, TransactionStatus } from './types'

export async function fetchNetworkTokens(chainId?: ChainId) {
  const response = await fetch(
    `https://bridgeapi.anyswap.exchange/v3/serverinfoV3?chainId=${chainId || 'all'}&version=UNDERLYINGV2`
  )
  const data = await response.json()
  return data
}

export async function pollTxURL(txhash: string) {
  const fn = () => fetchTxURL(txhash)
  const whileCondition = (result: PollData) =>
    result.msg !== 'Success' && result.info?.status !== TransactionStatus.Success
  await poll(fn, whileCondition, 5000)
  return `https://anyswap.net/explorer/tx?params=${txhash}`
}

async function fetchTxURL(txhash: string) {
  const response = await fetch(`https://bridgeapi.anyswap.exchange/v2/history/details?params=${txhash}`)
  const data = await response.json()
  return data
}
