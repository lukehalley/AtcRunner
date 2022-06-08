import { useEffect, useRef, useCallback } from 'react'
import { Listener } from '@ethersproject/abstract-provider'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from 'ethers'
import { useAddPopup } from 'features/application/hooks'
import { convertHeroId } from 'features/heroes/utils'
import { useDispatch, useSelector } from 'features/hooks'
import { GRAVEYARD_ADDRESSES, JOURNEY_ADDRESSES } from 'features/journey/constants'
import {
  initializeNotifications,
  addNotification,
  addPendingTransfer,
  removePendingTransfer,
  NotificationLevel
} from 'features/notifications'
import { useActiveWeb3React } from './index'
import { useAssistingAuctionContract, useHeroCoreContract, useLandAuctionCore } from './useContract'

interface NotificationEvent {
  event: string
  level: NotificationLevel
}

const safeToNumber = (bn: BigNumber) => {
  try {
    return bn.toNumber()
  } catch (e) {
    return null
  }
}

export const useWatchContractEvents = (
  contract: Contract | null,
  events: NotificationEvent[],
  getMessage: (e: any) => string
): void => {
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const watchFunctionsRef = useRef<{ [key: string]: { [key: string]: Listener } }>({})
  useEffect(() => {
    events.forEach(({ event, level }: NotificationEvent) => {
      const onEvent: Listener = (...contractEventArgs: Array<any>) => {
        // TODO:  type out all of the events
        const contractEvent = contractEventArgs[contractEventArgs.length - 1]
        const message = getMessage(contractEventArgs)
        if (!message) {
          return
        }
        dispatch(addNotification({ ...contractEvent, read: false, message }))
        addPopup(
          {
            txn: {
              hash: contractEvent.transactionHash,
              success: true,
              summary: message,
              level
            }
          },
          contractEvent.transactionHash
        )
      }
      if (
        contract?.address &&
        watchFunctionsRef.current[contract.address] &&
        watchFunctionsRef.current[contract.address][event]
      ) {
        contract.off(event, watchFunctionsRef.current[contract.address][event])
      }
      if (contract?.address && watchFunctionsRef.current[contract.address]) {
        watchFunctionsRef.current[contract.address][event] = onEvent
      } else if (contract?.address) {
        watchFunctionsRef.current[contract.address] = { [event]: onEvent }
      }
      if (contract?.on) {
        contract.on(event, onEvent)
      }
    })
  }, [contract?.address, getMessage])
}

// TODO store intermediary address that comes back from transfer event {from: me, to: intermediary, BigNumber heroId} -> {from: intermediary, to: purchaser, BigNumber: heroId}
export const useNotifications = () => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const pendingTransfers = useSelector(state => state.notifications.pendingTransfers)
  const heroCore = useHeroCoreContract()
  const assistingAuctionCore = useAssistingAuctionContract()
  const landsAuctionCore = useLandAuctionCore()

  useEffect(() => {
    dispatch(initializeNotifications())
  }, [])

  const heroCoreGetMessage = useCallback(
    ([from, to, tokenId, event]: any) => {
      const heroId: number | null = safeToNumber(tokenId)
      if (!heroId) {
        return ''
      }
      // it is a cancel if to === account
      if (
        to === account ||
        (chainId && to === JOURNEY_ADDRESSES[chainId]) ||
        (chainId && to === GRAVEYARD_ADDRESSES[chainId])
      ) {
        !!pendingTransfers[`${from}-${heroId}`] && dispatch(removePendingTransfer(`${from}-${heroId}`))
        return ''
      }
      if (pendingTransfers[`${from}-${heroId}`]) {
        dispatch(removePendingTransfer(`${from}-${heroId}`))
        return `Hero #${convertHeroId(heroId)} has been purchased.`
      } else if (from === account) {
        dispatch(addPendingTransfer({ event, contractAddress: to, address: from, tokenId: heroId }))
      }
      return ''
    },
    [account, Object.keys(pendingTransfers).length, dispatch, removePendingTransfer, addPendingTransfer]
  )

  useWatchContractEvents(heroCore, [{ event: 'Transfer', level: NotificationLevel.info }], heroCoreGetMessage)

  const assistingAuctionCoreGetMessage = useCallback(
    ([auctionId, tokenId, totalPrice, winner, event]: any) => {
      const heroId = safeToNumber(tokenId)
      if (!pendingTransfers[`${event?.address}-${heroId}`]) {
        return ''
      }
      dispatch(removePendingTransfer(`${event?.address}-${heroId}`))
      return heroId ? `Hero #${convertHeroId(heroId)} was hired.` : `Hero was hired.`
    },
    [dispatch, removePendingTransfer, Object.keys(pendingTransfers).length]
  )

  useWatchContractEvents(
    assistingAuctionCore,
    [{ event: 'AuctionSuccessful', level: NotificationLevel.info }],
    assistingAuctionCoreGetMessage
  )

  const heroSummoningCoreAuctionCreated = useCallback(
    ([auctionId, owner, tokenId, startingPrice, endingPrice, duration, winner, event]: any) => {
      const heroId = safeToNumber(tokenId)
      if (owner === account && !!heroId) {
        dispatch(addPendingTransfer({ event, contractAddress: event.address, address: owner, tokenId: heroId }))
      }
      return ''
    },
    [dispatch, addPendingTransfer, account]
  )

  useWatchContractEvents(
    assistingAuctionCore,
    [{ event: 'AuctionCreated', level: NotificationLevel.info }],
    heroSummoningCoreAuctionCreated
  )

  useWatchContractEvents(
    landsAuctionCore,
    [{ event: 'AuctionSuccessful', level: NotificationLevel.info }],
    ([auctionId, tokenId, totalPrice, winner, event]) => {
      const landId = safeToNumber(tokenId)
      if (!pendingTransfers[`${event?.address}-${landId}`]) {
        return ''
      }
      dispatch(removePendingTransfer(`${event?.address}-${landId}`))
      return `Land #${landId} was purchased.`
    }
  )

  useWatchContractEvents(
    landsAuctionCore,
    [{ event: 'AuctionCreated', level: NotificationLevel.info }],
    ([auctionId, owner, tokenId, startingPrice, endingPrice, duration, winner, event]: any) => {
      const landId = safeToNumber(tokenId)
      if (owner === account && !!landId) {
        dispatch(addPendingTransfer({ event, contractAddress: event.address, address: owner, tokenId: landId }))
      }
      return ''
    }
  )
}
