import { dispatch } from 'features'
import { removeClaimedAirdrop } from 'features/airdrops'
import { setGas } from 'utils'
import { fetchAirdrops } from 'utils/airdrops'
import { getAirdropCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'
import { Airdrop } from '.'

export const handleClaimAirdrop = async (
  airdrop: Airdrop,
  quantity: number,
  addTransaction: Function,
  setTransactionProcessing: Function
) => {
  const airdropCore = getAirdropCore()

  if (airdropCore) {
    try {
      setTransactionProcessing(true)
      const response = await airdropCore.claimAirdrop(airdrop.id, setGas())

      addTransaction(response, {
        summary: airdrop.item ? `Claimed ${quantity} ${airdrop.item.name} Airdrop` : `Claimed Airdrop`
      })

      await response.wait(1).then(receipt => {
        dispatch(removeClaimedAirdrop(airdrop))
        fetchAirdrops()
        setTransactionProcessing(false)
      })
    } catch (e) {
      setTransactionProcessing(false)
      errorHandler(e)
    }
  }
}
