import { Web3Provider } from '@ethersproject/providers'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId } from 'constants/sdk-extra'
import { getState } from 'features'

export function getAccount() {
  const { account } = getState().web3
  return typeof process.env.REACT_APP_TEST_ACCOUNT !== 'undefined'
    ? process.env.REACT_APP_TEST_ACCOUNT
    : (account as string)
}

export function getChainId() {
  const { chainId } = getState().web3
  return chainId as ChainId
}

export function getConnector() {
  const { connector } = getState().web3
  return connector as AbstractConnector
}

export function getLibrary() {
  const { library } = getState().web3
  return library as Web3Provider
}
