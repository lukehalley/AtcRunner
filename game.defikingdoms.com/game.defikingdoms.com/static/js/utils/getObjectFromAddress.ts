import { ChainId } from 'constants/sdk-extra'
import { getChainId } from 'features/web3/utils'

export function getObjectFromAddress<T, R>(address: string, map: T, chain?: ChainId): R | null {
  for (const [_, object] of Object.entries(map)) {
    const chainId = chain || getChainId()

    if (object.addresses[chainId] && address.toLowerCase() === object.addresses[chainId].toLowerCase()) {
      return object
    }
  }
  return null
}
