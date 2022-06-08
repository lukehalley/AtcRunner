import { dispatch } from 'features'
import { setAirdrops } from 'features/airdrops'
import { getItemFromAddress } from 'features/items/utils'
import { getAccount } from 'features/web3/utils'
import { getAirdropCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'

export const fetchAirdrops = async () => {
  const account = getAccount()
  const airdropCore = getAirdropCore()

  if (airdropCore && account) {
    try {
      const rawAirdrops = await airdropCore.viewAirdrops()
      const airdrops = rawAirdrops.map((airdrop: any, index: number) => {
        const { tokenAddress, amount, note, time } = airdrop
        const item = getItemFromAddress(tokenAddress)

        return {
          id: index,
          item,
          quantity: Number(amount),
          note,
          time: Number(time)
        }
      })

      dispatch(setAirdrops(airdrops))
    } catch (error) {
      errorHandler(error)
    }
  }
}
