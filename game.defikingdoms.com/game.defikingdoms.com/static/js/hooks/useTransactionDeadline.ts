import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { useSelector } from 'features/hooks'
import { useActiveWeb3React } from 'hooks'
import { isDFKChainHook } from 'utils'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const { chainId } = useActiveWeb3React()
  const { userDeadline } = useSelector(s => s.user)
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (blockTimestamp && userDeadline) {
      if (isDFKChainHook(chainId)) {
        return BigNumber.from(Date.now() + userDeadline)
      } else {
        return blockTimestamp.add(userDeadline)
      }
    }
    return undefined
  }, [blockTimestamp, userDeadline])
}
