import { ZERO_ONE_ADDRESS } from 'constants/index'
import { Contract } from 'ethers'
import { getAccount, getChainId, getLibrary } from 'features/web3/utils'
import { getProviderOrSigner } from 'utils'
import { DFKContract, GetContractData } from './types'

export const getMappedContract = (contract: DFKContract, data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = contract.addresses[chainId] || ZERO_ONE_ADDRESS
  const ABI = contract.abi as any

  return new Contract(address, ABI, getProviderOrSigner(library, account))
}
