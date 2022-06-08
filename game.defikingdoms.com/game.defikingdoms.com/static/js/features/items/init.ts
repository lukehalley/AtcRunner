import { useEffect } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { ZERO_ONE_ADDRESS } from 'constants/index'
import { BigNumber, Contract } from 'ethers'
import { dispatch } from 'features'
import { useActiveWeb3React } from 'hooks'
import { getContract } from 'utils'
import { getGoldCore } from 'utils/contracts'
import { itemMap } from './constants'
import { setGoldBalance, setItemDefaults, setUserItemMap, updateItemQuantity } from './state'
import { ItemKeys, ItemType } from './types'
import { getCollectionItemMapping, getItemAddress, getItemFromAddress } from './utils'

let goldTransferEvent: Contract
let itemEventContracts: Contract[] = []

export const useInitItems = () => {
  const { account, chainId, library } = useActiveWeb3React()

  useEffect(() => {
    initializeItemListenersAndSetMap(account, library)
    initializeGoldAndListener(account)

    return () => {
      removeItemsAndListeners()
    }
  }, [account, chainId])
}

const getItemContracts = async (account: any, library: any) => {
  const itemContracts = []

  for (const [key, item] of Object.entries(itemMap)) {
    const address = getItemAddress(key as ItemKeys)
    const ABI = item.abi

    if (address && ABI && library) {
      try {
        const contract = await getContract(address, ABI, library, account ? account : undefined)
        itemContracts.push(contract)
      } catch (error) {
        console.error('Failed to get contract', error)
      }
    }
  }

  itemEventContracts = itemContracts
  return itemContracts
}

export const initializeGoldAndListener = async (account?: string | null) => {
  const goldCore = getGoldCore()

  if (account) {
    try {
      const bigBalance: BigNumber = await goldCore.balanceOf(account)
      const balance = bigBalance.toNumber()

      // Gold balance includes three decimals
      const formattedBalance = Number((balance / 1000).toFixed(3))

      dispatch(setGoldBalance(formattedBalance))
    } catch (error) {
      console.log('error getting item quantity', error)
    }

    goldTransferEvent = goldCore.on('Transfer', async (sender: any, recipient: any, bigQuantity: any, event: any) => {
      if (sender === account || recipient === account) {
        const bigBalance: BigNumber = await goldCore.balanceOf(account)
        const balance = bigBalance.toNumber()

        // Gold balance includes three decimals
        const formattedBalance = Number((balance / 1000).toFixed(3))

        dispatch(setGoldBalance(formattedBalance))
      }
    })
  }
}

export const initializeItemListenersAndSetMap = async (account?: string | null, library?: Web3Provider) => {
  const itemContracts = await getItemContracts(account, library)
  const userItemMap: any = {}

  for (const contract of itemContracts) {
    const itemData = getItemFromAddress(contract.address)

    if (
      account &&
      contract.address !== ZERO_ONE_ADDRESS &&
      itemData &&
      itemData.type !== ItemType.HIDDEN &&
      itemData.type !== ItemType.SUBCOLLECTION
    ) {
      if (itemData.type === ItemType.COLLECTION) {
        contract.on('TransferSingle', async (sender, _, recipient, arg1, arg2, event) => {
          if (sender === account || recipient === account) {
            const itemAddress = event.address
            const item = getItemFromAddress(itemAddress)

            if (item) {
              const [addresses, indices] = getCollectionItemMapping(item, account)

              try {
                const balances = await contract.balanceOfBatch(addresses, indices)

                balances.forEach((bigBalance: BigNumber, index: number) => {
                  const quantity = bigBalance.toNumber()
                  const subItemData = item.collectionItems?.[index] && itemMap[item.collectionItems[index]]

                  if (subItemData && quantity > 0) {
                    dispatch(updateItemQuantity({ itemKey: subItemData.key, quantity }))
                  }
                })
              } catch (error) {
                console.log('error getting item collection quantity', contract.address)
              }
            }
          }
        })
      } else {
        contract.on('Transfer', async (sender, recipient, bigQuantity, event) => {
          if (sender === account || recipient === account) {
            const itemAddress = event.address
            const item = getItemFromAddress(itemAddress)
            const bigBalance: BigNumber = await contract.balanceOf(account)
            const quantity = bigBalance.toNumber()

            if (item) {
              dispatch(updateItemQuantity({ itemKey: item.key, quantity }))
            }
          }
        })
      }

      // ERC1155 collection - https://docs.openzeppelin.com/contracts/4.x/api/token/erc1155
      if (itemData.type === ItemType.COLLECTION && itemData.collectionItems) {
        const [addresses, indices] = getCollectionItemMapping(itemData, account)

        try {
          const balances = await contract.balanceOfBatch(addresses, indices)

          balances.forEach((bigBalance: BigNumber, index: number) => {
            const balance = bigBalance.toNumber()
            const subItemData = itemData.collectionItems?.[index] && itemMap[itemData.collectionItems[index]]

            if (subItemData && balance > 0) {
              const finalItem = {
                ...subItemData,
                quantity: balance
              }
              userItemMap[subItemData.key as ItemKeys] = finalItem
            }
          })
        } catch (error) {
          console.log('error getting item collection quantity', contract.address)
        }
      } else {
        try {
          const bigBalance: BigNumber = await contract.balanceOf(account)
          const balance = bigBalance.toNumber()

          if (itemData && balance > 0) {
            const finalItem = {
              ...itemData,
              quantity: balance
            }
            userItemMap[itemData.key as ItemKeys] = finalItem
          }
        } catch (error) {
          console.log('error getting item quantity', contract.address)
        }
      }
    }
  }

  dispatch(setUserItemMap(userItemMap))
}

export const removeItemsAndListeners = () => {
  for (const contract of itemEventContracts) {
    contract.removeAllListeners()
  }

  if (goldTransferEvent) {
    goldTransferEvent.removeAllListeners()
  }
  dispatch(setItemDefaults())
}
