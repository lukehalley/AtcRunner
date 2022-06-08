import { useState, useEffect } from 'react'
import { utils } from 'ethers'
import { useActiveWeb3React } from '../hooks'

export default function useWalletBalance() {
  const { account, library, chainId } = useActiveWeb3React()
  const [balance, setBalance] = useState<number | null>(null)
  useEffect(() => {
    if (!library || !account || balance !== null) {
      return
    }
    library.getBalance(account).then(b => {
      const balance = Number.parseFloat(utils.formatEther(b))
      setBalance(balance)
    })
  }, [chainId, library, account, typeof window !== 'undefined'])
  return balance
}
