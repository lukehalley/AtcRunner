import { TransactionReceipt } from '@ethersproject/providers'
import { ZERO_ONE_ADDRESS } from 'constants/index'
import { Token, TokenAmount } from 'constants/sdk-extra'
import store, { dispatch } from 'features'
import { setShowHeroHub } from 'features/heroHub/state'
import { updateHero } from 'features/heroes/state'
import { buildContractHero } from 'features/heroes/utils'
import { getChainId } from 'features/web3/utils'
import { useApproveCallback } from 'hooks/useApproveCallback'
import { getAddressFromKey } from 'utils/getAddressFromKey'
import { getObjectFromAddress } from 'utils/getObjectFromAddress'
import { Item } from './Item'
import { ItemMap, itemMap } from './constants'
import { setConsumedItemReward, setConsumedItemRewardModalOpen } from './state'
import { updateItemApprovalMap } from './state'
import { ItemEventTypes, ItemKeys } from './types'

interface TransactionReceiptWithEvents extends TransactionReceipt {
  events: any
}

export async function handleItemConsumed(receipt: TransactionReceipt) {
  console.log(receipt)
  const { profile } = store.getState().profile
  const itemConsumedEvent = (receipt as TransactionReceiptWithEvents).events.filter(
    (e: any) => e.event === ItemEventTypes.CONSUMED
  )[0]

  const { item, newHero } = itemConsumedEvent.args
  const itemObject = getItemFromAddress(item)
  const builtHero = buildContractHero(newHero, profile)
  const consumedItemReward = { item: itemObject, updatedHero: builtHero }

  dispatch(setShowHeroHub(false))
  dispatch(updateHero(builtHero))
  dispatch(setConsumedItemReward(consumedItemReward))
  dispatch(setConsumedItemRewardModalOpen(true))
}

export const useItemTokenApproval = (item: Item, coreAddress: string | undefined) => {
  const itemToken = getItemToken(item)
  const maxBurnRate = item.maxBurnRate || BigInt('9999999')
  const approvalArray = useApproveCallback(new TokenAmount(itemToken, maxBurnRate), coreAddress)

  dispatch(updateItemApprovalMap({ key: item.key, itemTokenApproval: approvalArray[0] }))
  return approvalArray
}

/* --- Get item Harmony address via key --- */
export const getItemAddress = (itemKey: ItemKeys) => {
  return getAddressFromKey(itemMap, itemKey)
}

/* --- Retrieve item via Harmony address --- */
export const getItemFromAddress = (address: string) => {
  return getObjectFromAddress<ItemMap, Item>(address, itemMap)
}

export const getItemToken = (item: Item): Token => {
  const chainId = getChainId()
  const address = item.addresses[chainId] || ZERO_ONE_ADDRESS
  return new Token(chainId, address, 0, item.tokenSymbol, item.name)
}

export const getCollectionItemMapping = (itemData: Item, account: string) => {
  const addresses: string[] = []
  const indices: number[] = []

  itemData.collectionItems?.forEach((_, i) => {
    addresses.push(account)
    indices.push(i)
  })

  return [addresses, indices]
}

export const formatItemQuantity = (quantity: number) => {
  const million = 1000000
  const hundredThousand = 100000
  const thousand = 1000

  if (quantity >= million) {
    const millionNumber = Number(quantity / million).toFixed(1)
    return `${millionNumber}M`
  } else if (quantity >= hundredThousand) {
    const hundredThousandNumber = Number(quantity / thousand).toFixed(1)
    return `${hundredThousandNumber}K`
  } else if (quantity >= thousand) {
    const thousandNumber = Number(quantity / thousand).toFixed(1)
    return `${thousandNumber}K`
  }

  return Math.floor(quantity)
}
