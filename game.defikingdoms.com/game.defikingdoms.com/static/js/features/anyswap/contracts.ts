import { getMultichainCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'
import { HandleSwapPayload } from './types'

export const handleAnySwapOut = async ({
  router,
  tokenAddress,
  toAddress,
  amount,
  toChainID,
  addTransaction,
  setTransactionProcessing,
  isUnderlying
}: HandleSwapPayload) => {
  const multichainCore = getMultichainCore(router)
  if (multichainCore) {
    try {
      setTransactionProcessing(true)
      const contractFn = isUnderlying ? multichainCore.anySwapOutUnderlying : multichainCore.anySwapOut
      const response = await contractFn(tokenAddress, toAddress, amount, toChainID)

      addTransaction(response, {
        summary: `Start Swap`
      })

      return await response.wait(1).then(receipt => {
        setTransactionProcessing(false)
        return receipt
      })
    } catch (e) {
      setTransactionProcessing(false)
      return errorHandler(e)
    }
  }
}
