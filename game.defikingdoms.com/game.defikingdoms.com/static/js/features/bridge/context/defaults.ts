import { supportedNetworks } from '@synapseprotocol/sdk'
import { getDestinationChains, getDestinationChainTokens } from '../utils'

export const sourceNetworks = supportedNetworks()
export const selectedSourceNetwork = sourceNetworks[0]
export const sourceTokens = selectedSourceNetwork.bridgeableTokens
export const selectedSourceToken = sourceNetworks[0].bridgeableTokens[0]
export const destinationNetworks = getDestinationChains({
  sourceChain: selectedSourceNetwork.chainId,
  sourceToken: selectedSourceToken
})
export const selectedDestinationNetwork = destinationNetworks[1]
export const destinationTokens = getDestinationChainTokens({
  sourceChain: selectedSourceNetwork.chainId,
  sourceToken: selectedSourceToken,
  destChain: selectedDestinationNetwork.chainId
})
export const selectedDestinationToken = destinationTokens[0]
