import { useMemo } from 'react'
import { Token, Price, WETH } from 'constants/sdk-extra'
import { usePair } from 'utils/data/Reserves'
import { useActiveWeb3React } from './index'

export default function useTokenWETHPrice(token: Token | undefined): Price | undefined {
  const { chainId } = useActiveWeb3React()
  const [, tokenWETHPair] = usePair(chainId && WETH[chainId], token)

  return useMemo(() => {
    return token && chainId && tokenWETHPair ? tokenWETHPair.priceOf(token) : undefined
  }, [chainId, token, tokenWETHPair])
}
