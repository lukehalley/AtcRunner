import { useMemo } from 'react'
import { Token, TokenAmount } from 'constants/sdk-extra'
import { useSingleCallResult } from 'features/multicall/hooks'
import { useTokenContract } from 'hooks/useContract'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
