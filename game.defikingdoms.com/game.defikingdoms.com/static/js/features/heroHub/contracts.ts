import { ChainId } from 'constants/sdk-extra'
import { dispatch } from 'features'
import { updateHero } from 'features/heroes/state'
import { setGas } from 'utils'
import { isHarmonyHook } from 'utils'
import { getAssistingAuctionCore, getSaleAuctionCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'

export const handleCancelRental = async (
  hero: Hero,
  addTransaction: Function,
  setTransactionProcessing: Function,
  chainId?: ChainId
) => {
  const assistingAuctionCore = getAssistingAuctionCore()
  setTransactionProcessing(true)

  try {
    const args = [hero.id] as const
    const response = isHarmonyHook(chainId)
      ? await assistingAuctionCore?.cancelAuction(...args, setGas())
      : await assistingAuctionCore?.cancelAuction(...args)

    addTransaction(response, {
      summary: `Cancel Rental`
    })

    await response.wait(1).then(() => {
      const newData = { ...hero, summoningPrice: 0 }
      dispatch(updateHero(newData))
    })
  } catch (error) {
    errorHandler(error)
  }
  setTransactionProcessing(false)
}

export const handleCancelSale = async (
  hero: Hero,
  addTransaction: Function,
  setTransactionProcessing: Function,
  chainId?: ChainId
) => {
  const saleAuctionCore = getSaleAuctionCore()
  setTransactionProcessing(true)

  try {
    const args = [hero.id] as const
    const response = isHarmonyHook(chainId)
      ? await saleAuctionCore?.cancelAuction(...args, setGas())
      : await saleAuctionCore?.cancelAuction(...args)

    addTransaction(response, {
      summary: `Cancel Sale`
    })

    await response.wait(1).then(() => {
      const newData = { ...hero, price: 0 }
      dispatch(updateHero(newData))
    })
  } catch (error) {
    errorHandler(error)
  }
  setTransactionProcessing(false)
}
