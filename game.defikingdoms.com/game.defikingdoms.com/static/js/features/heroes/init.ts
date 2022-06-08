import { useEffect } from 'react'
import { SALEAUCTION_ADDRESSES } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Contract } from 'ethers'
import store, { dispatch } from 'features'
import { ActiveModalType } from 'features/heroHub/types'
import { useActiveWeb3React } from 'hooks'
import { getAssistingAuctionCore, getHeroCore } from 'utils/contracts'
import { fetchUserHeroes } from './state'
import { addUserHero, removeUserHero, setHeroDefaults, updateHero } from './state'
import { buildContractHero } from './utils'

let heroTransferEvent: Contract
let auctionSuccessEvent: Contract

export const useInitHeroes = () => {
  const { account, chainId } = useActiveWeb3React()

  useEffect(() => {
    initializeHeroesAndListeners(account, chainId)

    return () => {
      removeHeroesAndListeners()
    }
  }, [account, chainId])
}

export const initializeHeroesAndListeners = (account?: string | null, chainId?: ChainId) => {
  const heroCore = getHeroCore({ account, chainId })
  const assistingAuctionCore = getAssistingAuctionCore({ account, chainId })

  const orderBy = ActiveModalType.quest ? 'current_stamina' : 'generation'
  const orderDir = ActiveModalType.quest ? 'desc' : 'asc'

  dispatch(
    fetchUserHeroes({
      account,
      chainId,
      order: { by: orderBy, dir: orderDir }
    })
  )

  auctionSuccessEvent = assistingAuctionCore?.on(
    'AuctionSuccessful',
    async (auctionId, tokenId, totalPrice, winner, event) => {
      const userHeroes = store.getState().heroes.userHeroes
      const heroId = tokenId.toNumber()
      const heroIndex = userHeroes.findIndex((obj: any) => obj.id === heroId)

      if (heroIndex > -1) {
        const newData = { ...userHeroes[heroIndex], summoningPrice: 0 }
        dispatch(updateHero(newData))
      }
    }
  )

  heroTransferEvent = heroCore?.on('Transfer', async (sender, recipient, tokenId, event) => {
    const auctionAddress = chainId ? SALEAUCTION_ADDRESSES[chainId] : undefined
    const userHeroes = store.getState().heroes.userHeroes
    const heroId = tokenId.toNumber()
    const heroIndex = userHeroes.findIndex((obj: any) => obj.id === heroId)

    // If user is recipient and doesn't already own the hero (eg. transfer back from SaleAuction address)
    if (account === recipient && heroIndex < 0) {
      const { profile } = store.getState().profile
      let transferHero

      // Retrieve hero data
      try {
        transferHero = await heroCore.getHero(tokenId)
      } catch (error) {
        console.log('error getting hero', error)
      }

      if (transferHero) {
        const builtHero = buildContractHero(transferHero, profile)
        builtHero.price = 0
        builtHero.summoningPrice = 0
        dispatch(addUserHero(builtHero))
      }
      // If user is sender and not transferring to SaleAuction address (eg. putting up For Sale)
    } else if (account === sender && recipient !== auctionAddress) {
      dispatch(removeUserHero(heroId))
      // If the hero is being transferred as a sale from SaleAuction to new user
    } else if (account !== recipient && recipient !== auctionAddress && heroIndex > -1) {
      dispatch(removeUserHero(heroId))
    }
  })
}

export const removeHeroesAndListeners = () => {
  heroTransferEvent.removeAllListeners()
  auctionSuccessEvent.removeAllListeners()
  dispatch(setHeroDefaults())
}
