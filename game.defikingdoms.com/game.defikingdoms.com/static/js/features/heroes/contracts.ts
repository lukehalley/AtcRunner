import { Contract, utils } from 'ethers'
import { dispatch } from 'features'
import { setShowHeroDetailsModal, setShowHeroHub } from 'features/heroHub/state'
import { getAccount, getChainId } from 'features/web3/utils'
import { isHarmonyHook, setGas } from 'utils'
import { getHeroCore, getSaleAuctionCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import { addUserHero, removeForSaleHero } from './state'

export const handleBuyHero = async (hero: Hero, addTransaction: Function, setTransactionProcessing: Function) => {
  const account = getAccount()
  const chainId = getChainId()
  const saleAuctionCore = getSaleAuctionCore()

  setTransactionProcessing(true)
  if (saleAuctionCore) {
    if (account?.toLowerCase() === hero.owner.owner.toLowerCase()) return
    try {
      const heroId = hero.id
      const price = hero.price

      const args = [heroId, utils.parseEther(price.toString())] as const

      const response = isHarmonyHook(chainId)
        ? await saleAuctionCore.bid(...args, setGas())
        : await saleAuctionCore.bid(...args)

      addTransaction(response, {
        summary: `Buy Hero`
      })

      await response.wait(1).then(() => {
        const updatedHero = { ...hero, price: 0 }
        dispatch(addUserHero(updatedHero))
        dispatch(removeForSaleHero(hero.id))
        dispatch(setShowHeroHub(false))
        dispatch(setShowHeroDetailsModal(false))
      })
    } catch (error) {
      errorHandler(error)
    }
  }

  setTransactionProcessing(false)
}

export const reapproveContract = async (govTokenContract: Contract | null, addTransaction: Function) => {
  const heroCore = getHeroCore()

  try {
    if (govTokenContract) {
      const response = await govTokenContract.approve(heroCore.address, BigInt('20000'), setGas())

      addTransaction(response, {
        summary: `Approve JEWEL`
      })
    }
  } catch (error) {
    errorHandler(error)
  }
}
