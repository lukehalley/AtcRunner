import { Web3Provider } from '@ethersproject/providers'
import { Networks, Token, Tokens } from '@synapseprotocol/sdk'
import { BigNumber, ethers } from 'ethers'
import { getProviderOrSigner } from 'utils'
import { CHAIN_PARAMS } from './constants'
import { toHexStr } from './utils'

export async function changeNetwork(ethereum: any, chainId: number, networkFrom: Networks.Network) {
  let isSuccessful = false
  if (networkFrom?.chainId !== chainId) {
    try {
      const error = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHexStr(networkFrom.chainId) }]
      })
      if (error === null) {
        isSuccessful = true
      }
    } catch (error) {
      const doesNotHavechain = (error as any).code === 4902
      if (doesNotHavechain) {
        try {
          const error = await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_PARAMS[networkFrom?.chainId as number]]
          })
          if (error === null) {
            isSuccessful = true
          }
        } catch (addError) {
          console.error(addError)
        }
      }
      console.error(error)
    }
  }
  return isSuccessful
}

export async function getAddressBalance(
  tokenAddress: string,
  account: string,
  library: Web3Provider,
  tokenDecimals?: number
) {
  const abi = [
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function'
    }
  ]
  try {
    const signer = getProviderOrSigner(library, account)
    const contract = new ethers.Contract(tokenAddress, abi, signer)
    const balance = await contract.balanceOf(account)
    return Number(balance) / (tokenDecimals ? Math.pow(10, tokenDecimals) : 1)
  } catch (error) {
    console.error(error)
  }
  return 0
}

export async function getTokenBalance(token: Token, account: any, chainId: number, library: Web3Provider) {
  const abi = [
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function'
    }
  ]
  const tokenAddress = token.isGasToken ? Tokens.gasTokenWrapper(token)?.address(chainId) : token.addresses[chainId]
  const tokenDecimals = token.decimals(chainId)
  if (tokenAddress) {
    try {
      let balance = BigNumber.from(0)
      const signer = getProviderOrSigner(library, account)
      if (token.isGasToken) {
        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner(account)
        balance = await signer.getBalance()
      } else {
        const contract = new ethers.Contract(tokenAddress, abi, signer)
        balance = await contract.balanceOf(account)
      }
      return Number(balance) / (tokenDecimals ? Math.pow(10, tokenDecimals) : 1)
    } catch (error) {
      console.error(error)
    }
  }
  return 0
}
