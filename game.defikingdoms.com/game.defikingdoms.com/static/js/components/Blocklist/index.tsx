import { ReactNode, useMemo } from 'react'
import { BLOCKED_ADDRESSES } from 'constants/index'
import { getAccount } from 'features/web3/utils'

export default function Blocklist({ children }: { children: ReactNode }) {
  const account = getAccount()
  const blocked: boolean = useMemo(() => Boolean(account && BLOCKED_ADDRESSES.indexOf(account) !== -1), [account])
  if (blocked) {
    return <div>Blocked address</div>
  }
  return <>{children}</>
}
