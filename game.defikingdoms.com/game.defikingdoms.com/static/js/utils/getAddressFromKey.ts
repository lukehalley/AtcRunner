import { getChainId } from 'features/web3/utils'

interface GenericAddressFunction {
  <T, K extends keyof T>(map: T, key: K): string
}

export const getAddressFromKey: GenericAddressFunction = (map, key) => {
  const chainId = getChainId()
  const object = map[key] as any
  return object.addresses[chainId]
}
