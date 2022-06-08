import { Item } from 'features/items/Item'
import { getChainId } from 'features/web3/utils'
import { setGas } from 'utils'
import { getItemConsumerCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import { handleItemConsumed } from './utils'

export const handleConsumeItem = async (
  item: Item,
  hero: Hero,
  addTransaction: Function,
  setTransactionProcessing: Function
) => {
  const itemConsumerCore = getItemConsumerCore()
  const chainId = getChainId()
  const itemAddress = item.addresses[chainId]

  if (itemConsumerCore && itemAddress) {
    try {
      setTransactionProcessing(true)
      const response = await itemConsumerCore.consumeItem(itemAddress, hero.id, setGas())

      addTransaction(response, {
        summary: `Consume ${item.name}`
      })

      await response.wait(1).then(receipt => {
        handleItemConsumed(receipt)
        setTransactionProcessing(false)
      })
    } catch (e) {
      setTransactionProcessing(false)
      errorHandler(e)
    }
  }
}
