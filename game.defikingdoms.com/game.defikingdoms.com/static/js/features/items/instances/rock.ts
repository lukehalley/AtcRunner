import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import rockImage from '../images/rock.png'
import { ItemKeys, ItemType } from '../types'

export const rock = new Item({
  key: ItemKeys.ROCK,
  name: 'Rock',
  description: 'You are overcome with the desire to paint some eyes on it.',
  image: rockImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
