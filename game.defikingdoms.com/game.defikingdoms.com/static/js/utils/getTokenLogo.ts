import { getChainId } from 'features/web3/utils'
import { isDFKChainHook } from 'utils'
import crystalTokenLogo from '../assets/images/crystal-logo.png'
import jewelTokenLogo from '../assets/images/jewel-logo.png'

export default function getTokenLogo(): string {
  const chainId = getChainId()
  return isDFKChainHook(chainId) ? crystalTokenLogo : jewelTokenLogo
}
